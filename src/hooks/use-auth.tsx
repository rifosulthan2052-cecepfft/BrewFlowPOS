
'use client';

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter, usePathname } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  supabaseClient: SupabaseClient;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const loading = user === null && !['/login'].includes(pathname);

  useEffect(() => {
    if (user && pathname === '/login') {
      router.push('/');
    } else if (!user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, pathname, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    router.push('/login');
  };

  const value = {
    user,
    supabaseClient,
    loading: loading,
    signOut,
  };
  
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
