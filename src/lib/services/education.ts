import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Education } from '@/types';
import { createConverter } from './converter';

export const EDUCATION_COLLECTION = 'education';

export async function getEducationList(): Promise<Education[]> {
  const eduRef = collection(db, EDUCATION_COLLECTION).withConverter(
    createConverter<Education>()
  );
  const snapshot = await getDocs(eduRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getEducationById(id: string): Promise<Education | null> {
  const docRef = doc(db, EDUCATION_COLLECTION, id).withConverter(
    createConverter<Education>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addEducation(
  data: Omit<Education, 'id'>
): Promise<string> {
  const eduRef = collection(db, EDUCATION_COLLECTION).withConverter(
    createConverter<Education>()
  );
  const docRef = await addDoc(eduRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Education);
  return docRef.id;
}

export async function updateEducation(
  id: string,
  data: Partial<Education>
): Promise<void> {
  const docRef = doc(db, EDUCATION_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEducation(id: string): Promise<void> {
  const docRef = doc(db, EDUCATION_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToEducation(
  callback: (educationList: Education[]) => void
): () => void {
  const eduRef = collection(db, EDUCATION_COLLECTION).withConverter(
    createConverter<Education>()
  );
  return onSnapshot(
    eduRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Education subscription error:', error);
    }
  );
}
