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
import { supabase } from '@/lib/supabase/client';
import { skillRowToModel, skillModelToRow, type SkillRow } from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import type { Skill } from '@/types';
import { createConverter } from './converter';

export const SKILLS_COLLECTION = 'skills';

export async function getSkillsList(): Promise<Skill[]> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase getSkillsList error:', error);
      return [];
    }
    return (data || []).map((row) => skillRowToModel(row as SkillRow));
  }

  const skillsRef = collection(db, SKILLS_COLLECTION).withConverter(
    createConverter<Skill>()
  );
  const snapshot = await getDocs(skillsRef);
  const list = snapshot.docs.map((docSnap) => docSnap.data());
  return list.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

export async function getSkillById(id: string): Promise<Skill | null> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getSkillById error:', error);
      return null;
    }
    return data ? skillRowToModel(data as SkillRow) : null;
  }

  const docRef = doc(db, SKILLS_COLLECTION, id).withConverter(
    createConverter<Skill>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addSkill(data: Omit<Skill, 'id'>): Promise<string> {
  if (isSupabaseBackend()) {
    const row = skillModelToRow(data);
    const { data: inserted, error } = await supabase
      .from('skills')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase addSkill error:', error);
      throw error;
    }
    return inserted.id;
  }

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
  if (isSupabaseBackend()) {
    const row = skillModelToRow(data);
    const { error } = await supabase.from('skills').update(row).eq('id', id);

    if (error) {
      console.error('Supabase updateSkill error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, SKILLS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteSkill(id: string): Promise<void> {
  if (isSupabaseBackend()) {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteSkill error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, SKILLS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToSkills(
  callback: (skillsList: Skill[]) => void
): () => void {
  if (isSupabaseBackend()) {
    let isMounted = true;
    getSkillsList()
      .then((data) => {
        if (isMounted) callback(data);
      })
      .catch((error) => {
        console.warn('Skills fetch error:', error);
      });
    return () => {
      isMounted = false;
    };
  }

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
