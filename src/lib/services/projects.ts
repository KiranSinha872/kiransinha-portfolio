import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { Project } from '@/types';
import { createConverter } from './converter';

export const PROJECTS_COLLECTION = 'projects';

export async function getProjectsList(): Promise<Project[]> {
  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  const snapshot = await getDocs(projectsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getProjectById(id: string): Promise<Project | null> {
  const docRef = doc(db, PROJECTS_COLLECTION, id).withConverter(
    createConverter<Project>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  const q = query(projectsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data();
}

export async function addProject(data: Omit<Project, 'id'>): Promise<string> {
  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  const docRef = await addDoc(projectsRef, {
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Project);
  return docRef.id;
}

export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToProjects(
  callback: (projectsList: Project[]) => void
): () => void {
  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  return onSnapshot(
    projectsRef,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap) => docSnap.data());
      callback(list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    },
    (error) => {
      console.warn('Projects subscription error:', error);
    }
  );
}
