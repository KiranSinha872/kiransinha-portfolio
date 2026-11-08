import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { createConverter } from './converter';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: unknown;
  read?: boolean;
}

export const CONTACT_COLLECTION = 'contact_messages';

export async function submitContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>
): Promise<string> {
  const contactRef = collection(db, CONTACT_COLLECTION).withConverter(
    createConverter<ContactMessage>()
  );
  const docRef = await addDoc(contactRef, {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  } as unknown as ContactMessage);
  return docRef.id;
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const contactRef = collection(db, CONTACT_COLLECTION).withConverter(
    createConverter<ContactMessage>()
  );
  const snapshot = await getDocs(contactRef);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

export async function markContactMessageRead(
  id: string,
  read: boolean = true
): Promise<void> {
  const docRef = doc(db, CONTACT_COLLECTION, id);
  await updateDoc(docRef, { read });
}

export async function deleteContactMessage(id: string): Promise<void> {
  const docRef = doc(db, CONTACT_COLLECTION, id);
  await deleteDoc(docRef);
}
