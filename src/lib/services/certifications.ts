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
import type { Certification } from '@/types';
import { createConverter } from './converter';

export const CERTIFICATIONS_COLLECTION = 'certifications';

export async function getCertificationsList(): Promise<Certification[]> {
  const certsRef = collection(db, CERTIFICATIONS_COLLECTION).withConverter(
    createConverter<Certification>()
  );
  const snapshot = await getDocs(certsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getCertificationById(
  id: string
): Promise<Certification | null> {
  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id).withConverter(
    createConverter<Certification>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addCertification(
  data: Omit<Certification, 'id'>
): Promise<string> {
  const certsRef = collection(db, CERTIFICATIONS_COLLECTION).withConverter(
    createConverter<Certification>()
  );
  const docRef = await addDoc(certsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Certification);
  return docRef.id;
}

export async function updateCertification(
  id: string,
  data: Partial<Certification>
): Promise<void> {
  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCertification(id: string): Promise<void> {
  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToCertifications(
  callback: (certsList: Certification[]) => void
): () => void {
  const certsRef = collection(db, CERTIFICATIONS_COLLECTION).withConverter(
    createConverter<Certification>()
  );
  return onSnapshot(
    certsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Certifications subscription error:', error);
    }
  );
}
