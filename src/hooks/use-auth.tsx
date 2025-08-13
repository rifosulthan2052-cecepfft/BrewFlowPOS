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
    console.log('AuthProvider - Initial user:', user);
    const initializeSession = async () => {
      // Check for access_token in URL hash
      const hash = window.location.hash;
      if (hash.includes('access_token')) {
        console.log('AuthProvider - Found access_token, attempting to set session');
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
          console.log('AuthProvider - Session error:', error.message);
        } else if (session) {
          console.log('AuthProvider - Session set:', session);
        }
      }
      setLoading(false);
    };

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthProvider - Event:', event, 'Session:', session);
      if (event === 'SIGNED_IN' && session) {
        console.log('AuthProvider - Checking metadata');
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error) {
          console.log('AuthProvider - Error fetching user:', error.message);
          setLoading(false);
          return;
        }
        console.log('AuthProvider - User metadata:', user?.user_metadata);
        if (user && !user.user_metadata?.password_set && window.location.pathname !== '/update-password') {
          console.log('AuthProvider - No password, redirecting to /update-password');
          router.push('/update-password');
        } else {
          console.log('AuthProvider - Refreshing for SIGNED_IN');
          router.refresh();
        }
      } else if (event === 'SIGNED_OUT' || (!session && !window.location.hash.includes('access_token'))) {
        console.log('AuthProvider - No session, redirecting to /login');
        router.push('/login');
      }
      setLoading(false);
    });

    initializeSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabaseClient.auth, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };

  if (loading) {
    console.log('AuthProvider - Loading, showing spinner');
    return <div>Loading...</div>;
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
