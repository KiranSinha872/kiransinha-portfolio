import { supabase } from '@/lib/supabase/client';

export interface ProcessedLogoResult {
  file: File;
  previewUrl: string;
}

/**
 * Maps Storage and network error codes to human-readable explanations.
 */
export function mapStorageError(err: unknown): string {
  if (!err) return 'Unknown upload error occurred.';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const code = (err as any)?.code;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const status = (err as any)?.status || (err as any)?.status_ || (err as any)?.serverResponse?.status;
  const message = err instanceof Error ? err.message : String(err);

  if (
    status === 404 ||
    code === 'storage/bucket-not-found' ||
    code === 'storage/project-not-found' ||
    message.includes('bucket does not exist') ||
    message.includes('The specified bucket does not exist') ||
    message.includes('Bucket not found') ||
    (code === 'storage/unknown' && message.includes('404'))
  ) {
    return 'Upload failed: Cloud Storage bucket has not been created yet (404). Ensure the "institutions" bucket exists.';
  }
  if (
    status === 401 ||
    status === 403 ||
    code === 'storage/unauthorized' ||
    message.includes('unauthorized') ||
    message.includes('permission denied') ||
    message.includes('Permission denied') ||
    message.includes('row-level security policy') ||
    message.includes('violates row-level security policy')
  ) {
    return 'Upload failed: Permission denied (403). Admin permissions are required to upload institution logos.';
  }
  if (
    status === 413 ||
    message.includes('exceeds') ||
    message.includes('Payload too large') ||
    message.includes('Maximum file size exceeded')
  ) {
    return 'Upload failed: File exceeds the 2MB size limit.';
  }
  if (code === 'storage/canceled') {
    return 'Upload was canceled.';
  }
  if (
    code === 'storage/retry-limit-exceeded' ||
    message.includes('timed out') ||
    message.includes('timeout') ||
    status === 408
  ) {
    return 'Upload failed: Connection timed out. Please check your network and retry.';
  }
  if (code === 'storage/quota-exceeded') {
    return 'Upload failed: Storage quota exceeded.';
  }
  if (code === 'storage/invalid-checksum') {
    return 'Upload failed: File corrupted during transfer. Please retry.';
  }

  return `Upload failed: ${message}`;
}

/**
 * Validates the raw uploaded file:
 * PNG, JPG, SVG, WebP up to 5MB.
 */
export function validateLogoFile(file: File): { valid: boolean; error?: string } {
  const maxBytes = 5 * 1024 * 1024; // 5 MB
  if (file.size > maxBytes) {
    return { valid: false, error: 'File size exceeds 5MB limit.' };
  }

  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();

  const isSvg = type === 'image/svg+xml' || name.endsWith('.svg');
  const isPng = type === 'image/png' || name.endsWith('.png');
  const isJpg =
    type === 'image/jpeg' ||
    type === 'image/jpg' ||
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg');
  const isWebp = type === 'image/webp' || name.endsWith('.webp');

  if (!isSvg && !isPng && !isJpg && !isWebp) {
    return {
      valid: false,
      error: 'Invalid file format. Please upload a PNG, JPG, SVG, or WebP file.',
    };
  }

  return { valid: true };
}

/**
 * Loads an HTMLImageElement with a 10-second safety timeout.
 */
function loadImage(src: string, timeoutMs = 10000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    timer = setTimeout(() => {
      cleanup();
      reject(new Error('Image rasterization timed out after 10 seconds.'));
    }, timeoutMs);

    img.onload = () => {
      cleanup();
      resolve(img);
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Failed to load image for processing.'));
    };

    if (!src.startsWith('blob:') && !src.startsWith('data:')) {
      img.crossOrigin = 'anonymous';
    }

    img.src = src;
  });
}

/**
 * Wraps canvas.toBlob in a promise with fallback from WebP to PNG and a 5-second timeout.
 */
function canvasToBlobWithFallback(
  canvas: HTMLCanvasElement,
  preferredFormat: 'image/webp' | 'image/png',
  quality?: number
): Promise<{ blob: Blob; format: string; ext: string }> {
  return new Promise((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
      reject(new Error('Canvas image conversion timed out.'));
    }, 5000);

    const tryFormat = (format: 'image/webp' | 'image/png') => {
      try {
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0) {
              if (timer) {
                clearTimeout(timer);
                timer = null;
              }
              resolve({
                blob,
                format: blob.type || format,
                ext: format === 'image/webp' ? 'webp' : 'png',
              });
            } else if (format === 'image/webp') {
              tryFormat('image/png');
            } else {
              if (timer) {
                clearTimeout(timer);
                timer = null;
              }
              reject(new Error('Canvas failed to produce an image blob.'));
            }
          },
          format,
          format === 'image/webp' ? quality : undefined
        );
      } catch (err) {
        if (format === 'image/webp') {
          tryFormat('image/png');
        } else {
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
          reject(err instanceof Error ? err : new Error('Canvas conversion error'));
        }
      }
    };

    tryFormat(preferredFormat);
  });
}

/**
 * Sanitizes and prepares SVG content by stripping scripts, inline handlers,
 * extracting intrinsic dimensions from viewBox if missing, and setting explicit width/height.
 */
async function prepareSvgBlob(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const svgText = await file.text();
  if (!svgText.includes('<svg')) {
    throw new Error('Invalid SVG content: missing <svg> element.');
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Malformed SVG file.');
  }

  const svgEl = doc.documentElement;
  if (!svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
    throw new Error('Invalid SVG root element.');
  }

  // Strip <script> elements
  doc.querySelectorAll('script').forEach((s) => s.remove());

  // Strip inline on* handlers
  doc.querySelectorAll('*').forEach((el) => {
    const attrs = Array.from(el.attributes);
    for (const attr of attrs) {
      if (attr.name.toLowerCase().startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    }
  });

  // Extract dimensions or derive from viewBox (fallback 512x512)
  let width = parseFloat(svgEl.getAttribute('width') || '');
  let height = parseFloat(svgEl.getAttribute('height') || '');

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    const viewBox = svgEl.getAttribute('viewBox');
    if (viewBox) {
      const parts = viewBox.trim().split(/[\s,]+/).map(Number);
      if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
        width = parts[2];
        height = parts[3];
      }
    }
  }

  if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
    width = 512;
    height = 512;
  }

  svgEl.setAttribute('width', String(Math.round(width)));
  svgEl.setAttribute('height', String(Math.round(height)));

  const serialized = new XMLSerializer().serializeToString(doc);
  const blob = new Blob([serialized], { type: 'image/svg+xml' });
  return { blob, width: Math.round(width), height: Math.round(height) };
}

/**
 * Internal logic for rasterizing/optimizing an image.
 */
async function processInstitutionLogoInternal(file: File): Promise<ProcessedLogoResult> {
  const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
  const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');

  let targetW = 512;
  let targetH = 512;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser canvas 2D context unavailable.');

  if (isSvg) {
    const { blob, width: naturalW, height: naturalH } = await prepareSvgBlob(file);
    const objectUrl = URL.createObjectURL(blob);
    try {
      const img = await loadImage(objectUrl, 10000);
      const nw = img.naturalWidth || naturalW || 512;
      const nh = img.naturalHeight || naturalH || 512;
      const maxDim = Math.max(nw, nh);
      const scale = maxDim > 512 ? 512 / maxDim : 1;
      targetW = Math.max(1, Math.round(nw * scale));
      targetH = Math.max(1, Math.round(nh * scale));

      canvas.width = targetW;
      canvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      ctx.drawImage(img, 0, 0, targetW, targetH);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }

    // SVGs are exported strictly as PNG to guarantee crisp line art and transparency
    const { blob: outBlob, format, ext } = await canvasToBlobWithFallback(canvas, 'image/png');
    if (outBlob.size > 2 * 1024 * 1024) {
      throw new Error('Processed image exceeds 2MB limit.');
    }

    const processedFile = new File([outBlob], `${baseName}.${ext}`, {
      type: format,
      lastModified: Date.now(),
    });
    const previewUrl = canvas.toDataURL(format);
    return { file: processedFile, previewUrl };
  }

  // Raster image (PNG, JPG, WebP)
  let bitmap: ImageBitmap | null = null;
  let imgElement: HTMLImageElement | null = null;
  let objectUrl = '';
  try {
    if (typeof createImageBitmap === 'function') {
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        bitmap = null;
      }
    }

    let sourceW = 512;
    let sourceH = 512;

    if (bitmap) {
      sourceW = bitmap.width;
      sourceH = bitmap.height;
    } else {
      objectUrl = URL.createObjectURL(file);
      imgElement = await loadImage(objectUrl, 10000);
      sourceW = imgElement.naturalWidth || imgElement.width || 512;
      sourceH = imgElement.naturalHeight || imgElement.height || 512;
    }

    const maxDim = Math.max(sourceW, sourceH);
    const scale = maxDim > 512 ? 512 / maxDim : 1;
    targetW = Math.max(1, Math.round(sourceW * scale));
    targetH = Math.max(1, Math.round(sourceH * scale));

    canvas.width = targetW;
    canvas.height = targetH;
    ctx.clearRect(0, 0, targetW, targetH);
    if (bitmap) {
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
    } else if (imgElement) {
      ctx.drawImage(imgElement, 0, 0, targetW, targetH);
    }
  } finally {
    if (bitmap) bitmap.close();
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }

  // Raster images export to WebP (quality 0.9) with fallback to PNG
  const { blob: outBlob, format, ext } = await canvasToBlobWithFallback(
    canvas,
    'image/webp',
    0.9
  );

  if (outBlob.size > 2 * 1024 * 1024) {
    throw new Error('Processed image exceeds 2MB limit.');
  }

  const processedFile = new File([outBlob], `${baseName}.${ext}`, {
    type: format,
    lastModified: Date.now(),
  });
  const previewUrl = canvas.toDataURL(format, 0.9);
  return { file: processedFile, previewUrl };
}

/**
 * Client-side processor with a strict 15-second overall timeout.
 * - If SVG: strips scripts/inline handlers, derives dimensions from viewBox if missing, exports PNG <= 512px.
 * - If Raster: decodes via createImageBitmap (or Image fallback), downscales <= 512px, exports WebP/PNG.
 * - Guarantees output is <= 2MB and never hangs.
 */
export async function processInstitutionLogo(file: File): Promise<ProcessedLogoResult> {
  return new Promise((resolve, reject) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        reject(new Error('Image processing timed out. Please try a different file.'));
      }
    }, 15000);

    processInstitutionLogoInternal(file)
      .then((res) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!settled) {
          settled = true;
          clearTimeout(timer);
          reject(err);
        }
      });
  });
}

/**
 * Uploads processed logo to Storage path: institutions/{educationId}-{timestamp}.{ext}
 * In Supabase mode, uses an XHR upload to the Storage REST API to support real-time progress callbacks.
 */
export async function uploadInstitutionLogoFile(
  file: File,
  educationId: string,
  onProgress?: (percent: number) => void,
  timeoutMs = 15000
): Promise<{ logoUrl: string; logoPath: string }> {
  const timestamp = Date.now();
  const ext = file.type === 'image/png' ? 'png' : 'webp';
  const cleanId = (educationId || 'new').replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `${cleanId}-${timestamp}.${ext}`;
  const fullPath = `institutions/${fileName}`;

  onProgress?.(15);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

      // Get authenticated session token if available
      let token = supabaseAnonKey;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          token = session.access_token;
        }
      } catch {
        // Fall back to anon key
      }

      // If in browser with XMLHttpRequest, upload with real-time progress events
      if (typeof XMLHttpRequest !== 'undefined' && supabaseUrl) {
        const uploadUrl = `${supabaseUrl}/storage/v1/object/institutions/${fileName}`;

        const xhrUploadPromise = new Promise<{ logoUrl: string; logoPath: string }>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', uploadUrl, true);
          xhr.setRequestHeader('apikey', supabaseAnonKey);
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.setRequestHeader('x-upsert', 'true');
          xhr.timeout = timeoutMs;

          xhr.upload.onprogress = (evt) => {
            if (evt.lengthComputable) {
              const pct = Math.min(95, Math.max(15, Math.round((evt.loaded / evt.total) * 100)));
              onProgress?.(pct);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              onProgress?.(100);
              const { data } = supabase.storage.from('institutions').getPublicUrl(fileName);
              resolve({ logoUrl: data.publicUrl, logoPath: fullPath });
            } else {
              let msg = xhr.statusText;
              try {
                const res = JSON.parse(xhr.responseText);
                msg = res.message || res.error || msg;
              } catch {
                // Keep statusText
              }
              reject(new Error(mapStorageError({ status: xhr.status, message: msg })));
            }
          };

          xhr.onerror = () => {
            reject(new Error(mapStorageError(new Error('Network error during storage upload.'))));
          };

          xhr.ontimeout = () => {
            reject(new Error(mapStorageError({ message: 'Upload timed out' })));
          };

          xhr.send(file);
        });

        return await xhrUploadPromise;
      }

      // Fallback to supabase-js client
      const uploadPromise = (async () => {
        onProgress?.(40);
        const { error } = await supabase.storage
          .from('institutions')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: true,
          });

        if (error) throw error;

        onProgress?.(90);
        const { data } = supabase.storage.from('institutions').getPublicUrl(fileName);
        onProgress?.(100);
        return { logoUrl: data.publicUrl, logoPath: fullPath };
      })();

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Upload timed out after 15 seconds.'));
        }, timeoutMs);
      });

      return await Promise.race([uploadPromise, timeoutPromise]);
    } catch (err) {
      console.error('Supabase Storage upload error:', err);
      throw new Error(mapStorageError(err));
    }
  }

/**
 * Deletes a file from Supabase Storage by full storage path.
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (!storagePath) return;

  try {
    const cleanPath = storagePath.startsWith('institutions/')
      ? storagePath.replace(/^institutions\//, '')
      : storagePath;
    await supabase.storage.from('institutions').remove([cleanPath]);
  } catch (err) {
    console.warn('Delete storage file failed on Supabase:', storagePath, err);
  }
}
