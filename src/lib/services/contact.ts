import {
  collection,
  doc,
  getDocs,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { supabase } from '@/lib/supabase/client';
import { contactRowToModel, type ContactRow } from '@/lib/supabase/mappers';
import { isSupabaseBackend } from './backend';
import { createConverter } from './converter';
import { contactMessageSchema } from '@/lib/security/validation';

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: unknown;
  read?: boolean;
}

export const CONTACT_COLLECTION = 'contact_messages';

/**
 * Submits contact message through the secure server Route Handler /api/contact.
 * Browser never writes directly to database; verified by Turnstile and rate-limited.
 */
export async function submitContactMessage(
  data: Omit<ContactMessage, 'id' | 'createdAt' | 'read'>,
  turnstileToken?: string
): Promise<string> {
  const validated = contactMessageSchema.parse(data);

  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...validated,
      turnstileToken,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to submit contact message.');
  }

  const result = await res.json();
  return result.id;
}

/**
 * Retrieves all inbound contact inquiries.
 * In Supabase mode, protected by RLS (only is_admin() can read).
 */
export async function getContactMessages(): Promise<ContactMessage[]> {
  if (isSupabaseBackend()) {
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

  const contactRef = collection(db, CONTACT_COLLECTION).withConverter(
    createConverter<ContactMessage>()
  );
  const snapshot = await getDocs(contactRef);
  return snapshot.docs.map((docSnap) => docSnap.data());
}

/**
 * Marks a contact message as read or unread.
 * Protected by admin authorization.
 */
export async function markContactMessageRead(
  id: string,
  read: boolean = true
): Promise<void> {
  if (isSupabaseBackend()) {
    const { error } = await supabase
      .from('contact_messages')
      .update({ read })
      .eq('id', id);

    if (error) {
      console.error('Supabase markContactMessageRead error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, CONTACT_COLLECTION, id);
  await updateDoc(docRef, { read });
}

/**
 * Deletes a contact inquiry.
 * Protected by admin authorization.
 */
export async function deleteContactMessage(id: string): Promise<void> {
  if (isSupabaseBackend()) {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteContactMessage error:', error);
      throw error;
    }
    return;
  }

  const docRef = doc(db, CONTACT_COLLECTION, id);
  await deleteDoc(docRef);
}
