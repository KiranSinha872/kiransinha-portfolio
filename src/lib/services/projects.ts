import { supabase } from '@/lib/supabase/client';
import { projectRowToModel, projectModelToRow, type ProjectRow } from '@/lib/supabase/mappers';
import type { Project } from '@/types';

export async function getProjectsList(): Promise<Project[]> {
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

export async function getProjectById(id: string): Promise<Project | null> {
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

export async function getProjectBySlug(slug: string): Promise<Project | null> {
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

export async function addProject(data: Omit<Project, 'id'>): Promise<string> {
  const row = projectModelToRow(data);
  const { data: inserted, error } = await supabase
    .from('projects')
    .insert(row)
    .select('id')
    .single();

  if (error || !inserted) {
    console.error('Supabase addProject error:', error);
    throw error || new Error('Failed to create project');
  }
  return inserted.id;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  const row = projectModelToRow(data);
  const { error } = await supabase
    .from('projects')
    .update({ ...row, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase updateProject error:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteProject error:', error);
    throw error;
  }
}

export function subscribeToProjects(
  callback: (projects: Project[]) => void
): () => void {
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
