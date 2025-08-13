// src/hooks/use-auth.tsx
'use client';

import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Event:', event, 'Session:', session);
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider - Checking metadata');
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user?.user_metadata?.password_set === false && window.location.pathname !== '/update-password') {
          console.log('AuthProvider - No password, redirecting to /update-password');
          router.push('/update-password');
        } else {
          console.log('AuthProvider - Refreshing for SIGNED_IN');
          router.refresh();
        }
      } else if (event === 'SIGNED_OUT') {
        console.log('AuthProvider - Refreshing for SIGNED_OUT');
        router.refresh();
      } else if (event === 'USER_UPDATED') {
        console.log('AuthProvider - Refreshing for USER_UPDATED');
        router.refresh();
      } else if (!session && !window.location.hash.includes('access_token')) {
        console.log('AuthProvider - No session, redirecting to /login');
        router.push('/login');
      }
      setLoading(false);
    });

    // Set loading to false if user is already available
    if (user) {
      console.log('AuthProvider - Initial user:', user);
      setLoading(false);
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabaseClient.auth, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    // No need to push, onAuthStateChange will handle it
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };

  if (loading) {
    console.log('AuthProvider - Loading, showing null');
    return null; // Could return a spinner here
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
