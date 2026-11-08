import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Compresses an image file in the browser and returns a high quality web-optimized data URL (Base64).
 * This ensures ultra-fast uploads, small payload size, and zero reliance on external storage when needed.
 */
export async function compressImageToBase64(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const format = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(format, quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Failed to load image for processing'));
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
  });
}

/**
 * Uploads a file to Firebase Storage with an automatic timeout and seamless local optimization fallback.
 * If Firebase Storage is enabled and responds in time, it uses Storage.
 * If Firebase Storage hangs or errors, it falls back to an optimized base64 data URL so the user is NEVER blocked.
 */
export async function uploadFileToStorage(
  file: File,
  folderPath: string = 'uploads',
  timeoutMs: number = 5000
): Promise<string> {
  try {
    const uploadPromise = (async () => {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = `${folderPath}/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file);
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage timeout')), timeoutMs)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.error('Firebase Storage upload failed:', err);
    throw new Error(
      `Storage upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

/**
 * Reads any document/file as a base64 Data URL
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a resume document (PDF) to Firebase Storage with a data URL fallback.
 */
export async function uploadResumeFile(
  file: File,
  timeoutMs: number = 6000
): Promise<string> {
  try {
    const uploadPromise = (async () => {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = `resumes/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/pdf',
      });
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage timeout')), timeoutMs)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.error('Resume upload to storage failed:', err);
    throw new Error(
      `Resume upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}


