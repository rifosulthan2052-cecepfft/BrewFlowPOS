
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
    // The user object's loading state is managed internally by useUser.
    // When the user object is no longer undefined, we know the initial check is complete.
    if (user !== undefined) {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log(`Supabase auth event: ${event}`);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        router.refresh();
      }
    });

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
    return null; // Render nothing while determining session state
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
