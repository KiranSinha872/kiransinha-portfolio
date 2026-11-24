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
import {
  certificationRowToModel,
  certificationModelToRow,
  type CertificationRow,
} from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import type { Certification } from '@/types';
import { createConverter } from './converter';

export const CERTIFICATIONS_COLLECTION = 'certifications';

export async function getCertificationsList(): Promise<Certification[]> {
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Supabase getCertificationsList error:', error);
      return [];
    }
    return (data || []).map((row) => certificationRowToModel(row as CertificationRow));
  }

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
  if (isSupabaseBackend()) {
    const { data, error } = await supabase
      .from('certifications')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Supabase getCertificationById error:', error);
      return null;
    }
    return data ? certificationRowToModel(data as CertificationRow) : null;
  }

  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id).withConverter(
    createConverter<Certification>()
  );
  const snap = await getDoc(docRef);
  return snap.exists() ? snap.data() : null;
}

export async function addCertification(
  data: Omit<Certification, 'id'>
): Promise<string> {
  if (isSupabaseBackend()) {
    const row = certificationModelToRow(data);
    const { data: inserted, error } = await supabase
      .from('certifications')
      .insert(row)
      .select('id')
      .single();

    if (error) {
      console.error('Supabase addCertification error:', error);
      throw error;
    }
    return inserted.id;
  }

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
  if (isSupabaseBackend()) {
    const row = certificationModelToRow(data);
    const { error } = await supabase.from('certifications').update(row).eq('id', id);

    if (error) {
      console.error('Supabase updateCertification error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCertification(id: string): Promise<void> {
  if (isSupabaseBackend()) {
    const { error } = await supabase.from('certifications').delete().eq('id', id);
    if (error) {
      console.error('Supabase deleteCertification error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, CERTIFICATIONS_COLLECTION, id);
  await deleteDoc(docRef);
}

export function subscribeToCertifications(
  callback: (certsList: Certification[]) => void
): () => void {
  if (isSupabaseBackend()) {
    let isMounted = true;
    getCertificationsList()
      .then((data) => {
        if (isMounted) callback(data);
      })
      .catch((error) => {
        console.warn('Certifications fetch error:', error);
      });
    return () => {
      isMounted = false;
    };
  }

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
