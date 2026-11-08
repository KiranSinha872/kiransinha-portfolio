import {
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Profile } from '@/types';
import { createConverter } from './converter';

export const PROFILE_COLLECTION = 'profile';
export const PROFILE_DOC_ID = 'main';

export async function getProfile(): Promise<Profile | null> {
  const profileRef = doc(db, PROFILE_COLLECTION, PROFILE_DOC_ID).withConverter(
    createConverter<Profile>()
  );
  const snap = await getDoc(profileRef);
  return snap.exists() ? snap.data() : null;
}

export async function updateProfile(data: Partial<Profile>): Promise<void> {
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
