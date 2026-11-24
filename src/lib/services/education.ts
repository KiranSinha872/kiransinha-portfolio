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
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase/client';
import { educationRowToModel, educationModelToRow, type EducationRow } from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import type { Education } from '@/types';
import { createConverter } from './converter';

export const EDUCATION_COLLECTION = 'education';

export async function deleteEducationLogoFile(logoPath: string): Promise<void> {
  if (!logoPath) return;

  if (isSupabaseBackend()) {
    try {
      await supabase.storage.from('institutions').remove([logoPath]);
    } catch (err) {
      console.warn('Failed to delete education logo from Supabase storage:', logoPath, err);
    }
    return;
  }

  try {
    const storageRef = ref(storage, logoPath);
    await deleteObject(storageRef);
  } catch (err) {
    console.warn('Failed to delete education logo from Firebase storage:', logoPath, err);
  }
}

export async function getEducationList(): Promise<Education[]> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase getEducationList error:', error);
      return [];
    }
    return (data || []).map((row) => educationRowToModel(row as EducationRow));
  }

  const eduRef = collection(db, EDUCATION_COLLECTION).withConverter(
    createConverter<Education>()
  );
  const snapshot = await getDocs(eduRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getEducationById(id: string): Promise<Education | null> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('education')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getEducationById error:', error);
      return null;
    }
    return data ? educationRowToModel(data as EducationRow) : null;
  }

  const docRef = doc(db, EDUCATION_COLLECTION, id).withConverter(
    createConverter<Education>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addEducation(
  data: Omit<Education, 'id'>
): Promise<string> {
  if (isSupabaseBackend()) {
    const row = educationModelToRow(data);
    const { data: inserted, error } = await supabase
      .from('education')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase addEducation error:', error);
      throw error;
    }
    return inserted.id;
  }

  const eduRef = collection(db, EDUCATION_COLLECTION).withConverter(
    createConverter<Education>()
  );

  const cleanData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  }

  const docRef = await addDoc(eduRef, {
    ...cleanData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Education);
  return docRef.id;
}

export async function updateEducation(
  id: string,
  data: Partial<Education>
): Promise<void> {
  if (isSupabaseBackend()) {
    const row = educationModelToRow(data);
    const { error } = await supabase.from('education').update(row).eq('id', id);

    if (error) {
      console.error('Supabase updateEducation error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, EDUCATION_COLLECTION, id);

  const cleanData: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(data)) {
    if (val !== undefined) {
      cleanData[key] = val;
    }
  }

  await updateDoc(docRef, {
    ...cleanData,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteEducation(id: string): Promise<void> {
  if (isSupabaseBackend()) {
    try {
      const { data: existing } = await supabase
        .from('education')
        .select('logo_path')
        .eq('id', id)
        .maybeSingle();

      if (existing?.logo_path) {
        await deleteEducationLogoFile(existing.logo_path);
      }
    } catch (err) {
      console.warn('Could not clean logo on Supabase delete:', err);
    }

    const { error } = await supabase.from('education').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteEducation error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, EDUCATION_COLLECTION, id);
  try {
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data?.logoPath) {
        await deleteEducationLogoFile(data.logoPath);
      }
    }
  } catch (err) {
    console.warn('Could not clean logo on Firebase delete:', err);
  }
  await deleteDoc(docRef);
}

export function subscribeToEducation(
  callback: (eduList: Education[]) => void
): () => void {
  if (isSupabaseBackend()) {
    let isMounted = true;
    getEducationList()
      .then((data) => {
        if (isMounted) callback(data);
      })
      .catch((error) => {
        console.warn('Education fetch error:', error);
      });
    return () => {
      isMounted = false;
    };
  }

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
