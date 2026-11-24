/**
 * Backend Provider Configuration
 * Checks whether the active data backend is Supabase or Firebase.
 */

export function isSupabaseBackend(): boolean {
  return process.env.NEXT_PUBLIC_DATA_BACKEND === 'supabase';
}
