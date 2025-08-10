
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
  const loading = user === null && pathname !== '/login'; // More accurate loading state

  useEffect(() => {
    if (!user && pathname !== '/login') {
      router.push('/login');
    } else if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, pathname, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    // The redirect to /login will be handled by the useEffect above
    router.push('/login');
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };
  
  // Render a loading state or null if the user state is not yet determined
  // This prevents rendering pages that might rely on the user object before it's available
  if (loading) {
    return null; // Or a loading spinner component
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
