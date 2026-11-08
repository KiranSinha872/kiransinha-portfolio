import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase/client';

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
 * Uploads an image file to Firebase Storage with strict client validation and timeout.
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
 * Uploads a resume document (PDF) to Firebase Storage with strict client validation.
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
