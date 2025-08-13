
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
    } = supabaseClient.auth.onAuthStateChange((event, session) => {
      // The router.refresh() is key to re-running the middleware
      // and getting the correct user state on the server.
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        router.refresh();
      }
      setLoading(false);
    });

    // Also set loading to false on initial load if user is already available
    if(user) {
        setLoading(false);
    }


    return () => {
      subscription.unsubscribe();
    };
  }, [user, supabaseClient.auth, router]);

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    // No need to push, onAuthStateChange will handle it.
  };

  const value = {
    user,
    supabaseClient,
    loading,
    signOut,
  };
  
  if (loading) {
    // You could return a global loading spinner here
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
