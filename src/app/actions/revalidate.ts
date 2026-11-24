'use server';

import { revalidatePath } from 'next/cache';

/**
 * On-demand revalidation server action for portfolio public pages.
 * Triggered after admin writes/mutations.
 */
export async function revalidatePortfolio(): Promise<{ success: boolean }> {
  try {
    revalidatePath('/');
    return { success: true };
  } catch (err) {
    console.warn('revalidatePortfolio warning:', err);
    return { success: false };
  }
}
