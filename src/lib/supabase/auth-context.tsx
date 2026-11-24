'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from './client';

export interface AuthUser {
  id: string;
  uid: string;
  email: string | null;
}

export interface AuthContextType {
  user: AuthUser | null;
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

/**
 * Checks whether a given user ID exists in the public.admins table.
 * Enforces that authentication is NOT authorization.
 */
async function verifyAdminRole(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to verify admin status:', err);
    return false;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const checkUserAdmin = useCallback(async (sbUser: SupabaseUser | null) => {
    if (!sbUser) {
      setUser(null);
      setLoading(false);
      return;
    }

    const isAdmin = await verifyAdminRole(sbUser.id);
    if (!isAdmin) {
      console.warn(`User ${sbUser.id} is authenticated but not in admins table. Denying access.`);
      await supabase.auth.signOut();
      setUser(null);
    } else {
      setUser({
        id: sbUser.id,
        uid: sbUser.id,
        email: sbUser.email || null,
      });
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial session check
    supabase.auth.getUser().then(({ data: { user } }) => {
      checkUserAdmin(user);
    });

    // Listen to auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) {
        setUser(null);
        setLoading(false);
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        await checkUserAdmin(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserAdmin]);

  const login = async (email: string, pass: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error('Authentication failed: No user returned.');
    }

    // Verify admin role explicitly
    const isAdmin = await verifyAdminRole(data.user.id);
    if (!isAdmin) {
      await supabase.auth.signOut();
      const notAuthError = new Error('Not authorized: Your account does not have administrative privileges.');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (notAuthError as any).code = 'auth/not-authorized';
      throw notAuthError;
    }

    setUser({
      id: data.user.id,
      uid: data.user.id,
      email: data.user.email || null,
    });

    return data;
  };

  const logout = async () => {
    await supabase.auth.signOut();
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
