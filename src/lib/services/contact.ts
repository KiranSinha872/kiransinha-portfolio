import { supabase } from '@/lib/supabase/client';
import { contactRowToModel, contactModelToRow, type ContactRow } from '@/lib/supabase/mappers';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: unknown;
  read?: boolean;
}

export async function submitContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt'>,
  turnstileToken?: string
): Promise<string> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, turnstileToken }),
  });

  const resJson = await response.json();
  if (!response.ok) {
    throw new Error(resJson.error || 'Failed to submit contact message.');
  }

  return resJson.id || 'success';
}

export async function getContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Supabase getContactMessages error:', error);
    return [];
  }
  return (data || []).map((row) => contactRowToModel(row as ContactRow));
}

export async function markContactMessageRead(
  id: string,
  read: boolean
): Promise<void> {
  const row = contactModelToRow({ read });
  const { error } = await supabase
    .from('contact_messages')
    .update(row)
    .eq('id', id);

  if (error) {
    console.error('Supabase markContactMessageRead error:', error);
    throw error;
  }
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase
    .from('contact_messages')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Supabase deleteContactMessage error:', error);
    throw error;
  }
}
