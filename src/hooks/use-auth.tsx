
'use client';

import React, { createContext, useContext, useEffect, ReactNode, useState } from 'react';
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/navigation';
import type { SupabaseClient, User } from '@supabase/supabase-js';

interface AuthContextType {
user: User | null;
supabaseClient: SupabaseClient;
  loading: boolean;
signOut: () => Promise<void>;
}

@@ -19,21 +18,13 @@ export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
      // The router.refresh() is crucial for re-running the middleware
      // after the client-side session is established or changed.
if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
router.refresh();
}
@@ -51,14 +42,9 @@ export const AuthProvider = ({ children }: { children: ReactNode }) => {
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
