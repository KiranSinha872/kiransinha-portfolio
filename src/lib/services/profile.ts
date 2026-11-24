import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase/client';
import { profileRowToModel, profileModelToRow, type ProfileRow } from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import type { Profile } from '@/types';
import { createConverter } from './converter';

export const PROFILE_COLLECTION = 'profile';
export const PROFILE_DOC_ID = 'main';
const SUPABASE_PROFILE_ID = '00000000-0000-0000-0000-000000000001';

export async function getProfile(): Promise<Profile | null> {
  if (isSupabaseBackend()) {
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

  const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID).withConverter(
    createConverter<Profile>()
  );
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateProfile(data: Partial<Profile>): Promise<void> {
  if (isSupabaseBackend()) {
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
    return;
  }

  const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID);
  await setDoc(
    profileRef,
    {
      ...data,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
}

export function subscribeToProfile(
  callback: (profile: Profile | null) => void
): () => void {
  if (isSupabaseBackend()) {
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

  const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID).withConverter(
    createConverter<Profile>()
  );
  return onSnapshot(
    profileRef,
    (snap) => {
      callback(snap.exists() ? snap.data() : null);
    },
    (error) => {
      console.warn('Profile subscription error:', error);
    }
  );
}
