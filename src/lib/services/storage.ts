import { supabase } from '@/lib/supabase/client';

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

const MAX_RESUME_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_RESUME_TYPES = ['application/pdf'];

export const uploadFileToStorage = uploadImageFile;
function resolveBucketAndKey(folderPath: string, fileName: string): { bucket: string; objectKey: string } {
  const cleanFolder = folderPath.replace(/^\/+|\/+$/g, '');
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${sanitizedName}`;

  if (['projects', 'certifications', 'resumes', 'institutions', 'avatars'].includes(cleanFolder)) {
    return { bucket: cleanFolder, objectKey: filename };
  }
  return { bucket: 'projects', objectKey: filename };
}

/**
 * Uploads an image file to Supabase Storage with strict client validation and timeout.
 */
export async function uploadImageFile(
  file: File,
  folderPath: string,
  timeoutMs: number = 8000
): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image file exceeds 5MB maximum limit.');
  }

  if (file.type && !ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are accepted.');
  }

  try {
    const { bucket, objectKey } = resolveBucketAndKey(folderPath, file.name);

    const uploadPromise = (async () => {
      const { error } = await supabase.storage
        .from(bucket)
        .upload(objectKey, file, {
          contentType: file.type || 'image/webp',
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from(bucket).getPublicUrl(objectKey);
      return data.publicUrl;
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase Storage request timed out.')), timeoutMs)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.error('Supabase Storage upload failed:', err);
    throw new Error(
      `Storage upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

/**
 * Uploads a resume document (PDF) to Storage with strict client validation.
 */
export async function uploadResumeFile(
  file: File,
  timeoutMs: number = 8000
): Promise<string> {
  if (file.size > MAX_RESUME_SIZE_BYTES) {
    throw new Error('Resume file exceeds 10MB maximum limit.');
  }

  if (file.type && !ALLOWED_RESUME_TYPES.includes(file.type.toLowerCase()) && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Only PDF documents are accepted for resumes.');
  }

  try {
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const objectKey = `${timestamp}_${sanitizedName}`;

    const uploadPromise = (async () => {
      const { error } = await supabase.storage
        .from('resumes')
        .upload(objectKey, file, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (error) throw error;

      const { data } = supabase.storage.from('resumes').getPublicUrl(objectKey);
      return data.publicUrl;
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase Storage request timed out.')), timeoutMs)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.error('Resume upload to Supabase storage failed:', err);
    throw new Error(
      `Resume upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

/**
 * Universal delete helper for storage files across Supabase.
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (!storagePath) return;

  try {
    const clean = storagePath.replace(/^\/+/, '');
    const parts = clean.split('/');
    let bucket = 'projects';
    let path = clean;

    if (parts.length > 1 && ['projects', 'certifications', 'resumes', 'institutions', 'avatars'].includes(parts[0])) {
      bucket = parts[0];
      path = parts.slice(1).join('/');
    }

    await supabase.storage.from(bucket).remove([path]);
  } catch (err) {
    console.warn('Failed to delete storage file from Supabase:', storagePath, err);
  }
}
