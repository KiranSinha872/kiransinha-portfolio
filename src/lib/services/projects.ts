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
import { supabase } from '@/lib/supabase/client';
import { projectRowToModel, projectModelToRow, type ProjectRow } from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import type { Project } from '@/types';
import { createConverter } from './converter';

export const PROJECTS_COLLECTION = 'projects';

export async function getProjectsList(): Promise<Project[]> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase getProjectsList error:', error);
      return [];
    }
    return (data || []).map((row) => projectRowToModel(row as ProjectRow));
  }

  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  const snapshot = await getDocs(projectsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getProjectById(id: string): Promise<Project | null> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getProjectById error:', error);
      return null;
    }
    return data ? projectRowToModel(data as ProjectRow) : null;
  }

  const docRef = doc(db, PROJECTS_COLLECTION, id).withConverter(
    createConverter<Project>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) {
      console.error('Supabase getProjectBySlug error:', error);
      return null;
    }
    return data ? projectRowToModel(data as ProjectRow) : null;
  }

  const projectsRef = collection(db, PROJECTS_COLLECTION).withConverter(
    createConverter<Project>()
  );
  const q = query(projectsRef, where('slug', '==', slug));
  const snapshot = await getDocs(q);
  return snapshot.empty ? null : snapshot.docs[0].data();
}

export async function addProject(data: Omit<Project, 'id'>): Promise<string> {
  if (isSupabaseBackend()) {
    const row = projectModelToRow(data);
    const { data: inserted, error } = await supabase
      .from('projects')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase addProject error:', error);
      throw error;
    }
    return inserted.id;
  }

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
  if (isSupabaseBackend()) {
    const row = projectModelToRow(data);
    const { error } = await supabase.from('projects').update(row).eq('id', id);

    if (error) {
      console.error('Supabase updateProject error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, PROJECTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteProject(id: string): Promise<void> {
  if (isSupabaseBackend()) {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteProject error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToProjects(
  callback: (projectsList: Project[]) => void
): () => void {
  if (isSupabaseBackend()) {
    let isMounted = true;
    getProjectsList()
      .then((data) => {
        if (isMounted) callback(data);
      })
      .catch((error) => {
        console.warn('Projects fetch error:', error);
      });
    return () => {
      isMounted = false;
    };
  }

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
