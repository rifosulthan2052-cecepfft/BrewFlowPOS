
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
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/');
      } else if (event === 'SIGNED_OUT') {
        router.push('/login');
      }
    });

    // Initial check
    const checkUser = async () => {
      const { data: { user } } = await supabaseClient.auth.getUser();
      if (!user && pathname !== '/login') {
        router.push('/login');
      } else if (user && pathname === '/login') {
        router.push('/');
      }
      setLoading(false);
    };

    checkUser();

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabaseClient.auth, pathname]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    // The onAuthStateChange listener will handle the redirect
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };
  
  if (loading) {
    return null; // Or a loading spinner
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
