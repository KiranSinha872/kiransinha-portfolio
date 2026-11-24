import { supabase } from '@/lib/supabase/client';
import { skillRowToModel, skillModelToRow, type SkillRow } from '@/lib/supabase/mappers';
import type { Skill } from '@/types';

export async function getSkillsList(): Promise<Skill[]> {
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

export async function getSkillById(id: string): Promise<Skill | null> {
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

export async function addSkill(data: Omit<Skill, 'id'>): Promise<string> {
  const row = skillModelToRow(data);
  const { data: inserted, error } = await supabase
    .from('skills')
    .insert(row)
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('Supabase addSkill error:', error);
    throw error || new Error('Failed to create skill');
  }
  return inserted.id;
}

export async function updateSkill(id: string, data: Partial<Skill>): Promise<void> {
  const row = skillModelToRow(data);
  const { error } = await supabase
    .from('skills')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase updateSkill error:', error);
    throw error;
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteSkill error:', error);
    throw error;
  }
}

export function subscribeToSkills(
  callback: (skills: Skill[]) => void
): () => void {
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
