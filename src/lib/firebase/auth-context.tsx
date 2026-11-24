'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth as fbAuth } from './client';
import { supabase } from '@/lib/supabase/client';
import { isSupabaseBackend } from '@/lib/services/backend';

export interface NormalizedUser {
  id: string;
  uid: string;
  email: string | null;
}

export interface AuthContextType {
  user: NormalizedUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<unknown>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {
    throw new Error('AuthContext not initialized');
  },
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<NormalizedUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Check admin role in Supabase public.admins table
  const checkSupabaseAdmin = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      return !error && !!data;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (isSupabaseBackend()) {
      supabase.auth.getUser().then(async ({ data: { user: sbUser } }) => {
        if (!sbUser) {
          setUser(null);
          setLoading(false);
          return;
        }
        const isAdmin = await checkSupabaseAdmin(sbUser.id);
        if (!isAdmin) {
          await supabase.auth.signOut();
          setUser(null);
        } else {
          setUser({ id: sbUser.id, uid: sbUser.id, email: sbUser.email || null });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          setUser(null);
          setLoading(false);
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          const isAdmin = await checkSupabaseAdmin(session.user.id);
          if (!isAdmin) {
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser({ id: session.user.id, uid: session.user.id, email: session.user.email || null });
          }
          setLoading(false);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }

    // Firebase Auth implementation
    const unsubscribe = onAuthStateChanged(fbAuth, (currentUser) => {
      if (currentUser) {
        setUser({
          id: currentUser.uid,
          uid: currentUser.uid,
          email: currentUser.email || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [checkSupabaseAdmin]);

  const login = async (email: string, pass: string) => {
    if (isSupabaseBackend()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: pass,
      });
      if (error) throw error;
      if (!data.user) throw new Error('No user returned from login');

      const isAdmin = await checkSupabaseAdmin(data.user.id);
      if (!isAdmin) {
        await supabase.auth.signOut();
        const err = new Error('Not authorized: Your account does not have administrative privileges.');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (err as any).code = 'auth/not-authorized';
        throw err;
      }

      setUser({ id: data.user.id, uid: data.user.id, email: data.user.email || null });
      return data;
    }

    // Firebase login
    const cred = await signInWithEmailAndPassword(fbAuth, email, pass);
    setUser({ id: cred.user.uid, uid: cred.user.uid, email: cred.user.email || null });
    return cred;
  };

  const logout = async () => {
    if (isSupabaseBackend()) {
      await supabase.auth.signOut();
    } else {
      await firebaseSignOut(fbAuth);
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
