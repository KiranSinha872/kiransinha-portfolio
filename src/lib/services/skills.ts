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
import type { Skill } from '@/types';
import { createConverter } from './converter';

export const SKILLS_COLLECTION = 'skills';

export async function getSkillsList(): Promise<Skill[]> {
  const skillsRef = collection(db, SKILLS_COLLECTION).withConverter(
    createConverter<Skill>()
  );
  const snapshot = await getDocs(skillsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getSkillById(id: string): Promise<Skill | null> {
  const docRef = doc(db, SKILLS_COLLECTION, id).withConverter(
    createConverter<Skill>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addSkill(data: Omit<Skill, 'id'>): Promise<string> {
  const skillsRef = collection(db, SKILLS_COLLECTION).withConverter(
    createConverter<Skill>()
  );
  const docRef = await addDoc(skillsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Skill);
  return docRef.id;
}

export async function updateSkill(
  id: string,
  data: Partial<Skill>
): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSkill(id: string): Promise<void> {
  const docRef = doc(db, SKILLS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToSkills(
  callback: (skillsList: Skill[]) => void
): () => void {
  const skillsRef = collection(db, SKILLS_COLLECTION).withConverter(
    createConverter<Skill>()
  );
  return onSnapshot(
    skillsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Skills subscription error:', error);
    }
  );
}
