import { z } from 'zod';

/**
 * Strips HTML tags and potential script injection strings from text inputs.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // remove HTML tags
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove ASCII control characters
    .trim();
}

/**
 * Strict schema for contact form messages matching Firestore security rules
 */
export const contactMessageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters')
    .transform(sanitizeInput)
    .refine((val) => val.length > 0, 'Name is required'),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(100, 'Email cannot exceed 100 characters'),
  message: z
    .string()
    .trim()
    .min(1, 'Message is required')
    .max(3000, 'Message cannot exceed 3000 characters')
    .transform(sanitizeInput)
    .refine((val) => val.length > 0, 'Message is required'),
});

export type ContactMessageInput = z.infer<typeof contactMessageSchema>;
