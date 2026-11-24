import { supabase } from '@/lib/supabase/client';
import { certificationRowToModel, certificationModelToRow, type CertificationRow } from '@/lib/supabase/mappers';
import type { Certification } from '@/types';

export async function getCertificationsList(): Promise<Certification[]> {
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

export async function getCertificationById(id: string): Promise<Certification | null> {
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

export async function addCertification(data: Omit<Certification, 'id'>): Promise<string> {
  const row = certificationModelToRow(data);
  const { data: inserted, error } = await supabase
    .from('certifications')
    .insert(row)
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('Supabase addCertification error:', error);
    throw error || new Error('Failed to create certification entry');
  }
  return inserted.id;
}

export async function updateCertification(
  id: string,
  data: Partial<Certification>
): Promise<void> {
  const row = certificationModelToRow(data);
  const { error } = await supabase
    .from('certifications')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase updateCertification error:', error);
    throw error;
  }
}

export async function deleteCertification(id: string): Promise<void> {
  const { error } = await supabase
    .from('certifications')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteCertification error:', error);
    throw error;
  }
}

export function subscribeToCertifications(
  callback: (certifications: Certification[]) => void
): () => void {
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
