import { supabase } from '@/lib/supabase/client';
import { profileRowToModel, profileModelToRow, type ProfileRow } from '@/lib/supabase/mappers';
import type { Profile } from '@/types';

export const PROFILE_DOC_ID = 'main';
const SUPABASE_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profile')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Supabase getProfile error:', error);
    return null;
  }
  return data ? profileRowToModel(data as ProfileRow) : null;
}

export async function updateProfile(data: Partial<Profile>): Promise<void> {
  const row = profileModelToRow(data);
  const { error } = await supabase.from('profile').upsert({
    id: SUPABASE_PROFILE_ID,
    ...row,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    console.error('Supabase updateProfile error:', error);
    throw error;
  }
}

export function subscribeToProfile(
  callback: (profile: Profile | null) => void
): () => void {
  let isMounted = true;
  getProfile()
    .then((data) => {
      if (isMounted) callback(data);
    })
    .catch((error) => {
      console.warn('Profile fetch error:', error);
    });
  return () => {
    isMounted = false;
  };
}
