
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
    if (user) {
      setLoading(false);
    } else {
        // If there's no user, we might be about to be redirected, or we are on the login page.
        // We can consider loading finished in this case as well.
        setLoading(false);
    }
  }, [user]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    // The middleware will handle the redirect to /login
    router.push('/login');
    router.refresh();
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };
  
  if (loading) {
    return null; // Or a dedicated loading screen component
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
