import { supabase } from '@/lib/supabase/client';
import { educationRowToModel, educationModelToRow, type EducationRow } from '@/lib/supabase/mappers';
import type { Education } from '@/types';

export async function deleteEducationLogoFile(logoPath: string): Promise<void> {
  if (!logoPath) return;
  try {
    const cleanPath = logoPath.startsWith('institutions/')
      ? logoPath.replace(/^institutions\//, '')
      : logoPath;
    await supabase.storage.from('institutions').remove([cleanPath]);
  } catch (err) {
    console.warn('Failed to delete education logo from Supabase storage:', logoPath, err);
  }
}

export async function getEducationList(): Promise<Education[]> {
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

export async function getEducationById(id: string): Promise<Education | null> {
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

export async function addEducation(data: Omit<Education, 'id'>): Promise<string> {
  const row = educationModelToRow(data);
  const { data: inserted, error } = await supabase
    .from('education')
    .insert(row)
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('Supabase addEducation error:', error);
    throw error || new Error('Failed to create education entry');
  }
  return inserted.id;
}

export async function updateEducation(
  id: string,
  data: Partial<Education>,
  previousLogoPath?: string
): Promise<void> {
  if (previousLogoPath && data.logoPath && previousLogoPath !== data.logoPath) {
    await deleteEducationLogoFile(previousLogoPath);
  }

  const row = educationModelToRow(data);
  const { error } = await supabase
    .from('education')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase updateEducation error:', error);
    throw error;
  }
}

export async function deleteEducation(
  id: string,
  associatedLogoPath?: string
): Promise<void> {
  if (associatedLogoPath) {
    try {
      await deleteEducationLogoFile(associatedLogoPath);
    } catch (err) {
      console.warn('Could not clean logo on Supabase delete:', err);
    }
  }

  const { error } = await supabase
    .from('education')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteEducation error:', error);
    throw error;
  }
}

export function subscribeToEducation(
  callback: (education: Education[]) => void
): () => void {
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
