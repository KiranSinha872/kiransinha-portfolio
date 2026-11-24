import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseBackend } from './backend';

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

/**
 * Resolves the Supabase bucket name and object key from a target folder path.
 */
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
 * Uploads an image file to Storage with strict client validation and timeout.
 * Automatically targets Supabase Storage or Firebase Storage depending on active backend.
 */
export async function uploadFileToStorage(
  file: File,
  folderPath: string = 'uploads',
  timeoutMs: number = 8000
): Promise<string> {
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error('Image size exceeds 5MB maximum limit.');
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type.toLowerCase())) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: JPEG, PNG, WebP, GIF.`);
  }

  // Supabase Storage implementation
  if (isSupabaseBackend()) {
    try {
      const { bucket, objectKey } = resolveBucketAndKey(folderPath, file.name);

      const uploadPromise = (async () => {
        const { error } = await supabase.storage
          .from(bucket)
          .upload(objectKey, file, {
            contentType: file.type,
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

  // Firebase Storage fallback
  try {
    const uploadPromise = (async () => {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = `${folderPath}/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
      });
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage request timed out.')), timeoutMs)
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

  // Supabase Storage implementation
  if (isSupabaseBackend()) {
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

  // Firebase Storage fallback
  try {
    const uploadPromise = (async () => {
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fullPath = `resumes/${timestamp}_${sanitizedName}`;
      const storageRef = ref(storage, fullPath);
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: 'application/pdf',
      });
      return await getDownloadURL(snapshot.ref);
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Firebase Storage request timed out.')), timeoutMs)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (err) {
    console.error('Resume upload to storage failed:', err);
    throw new Error(
      `Resume upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    );
  }
}

/**
 * Universal delete helper for storage files across Supabase and Firebase.
 */
export async function deleteStorageFile(storagePath: string): Promise<void> {
  if (!storagePath) return;

  if (isSupabaseBackend()) {
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
    return;
  }

  try {
    const storageRef = ref(storage, storagePath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Failed to delete storage file from Firebase:', storagePath, err);
  }
}
