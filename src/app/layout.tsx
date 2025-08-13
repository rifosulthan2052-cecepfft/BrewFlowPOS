// src/app/layout.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/components/layout/AppProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { createBrowserClient } from '@supabase/ssr';
import { SessionContextProvider } from '@supabase/auth-helpers-react';
import type { Database } from '@/types/supabase';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [supabaseClient] = useState(() =>
    createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          sameSite: 'none',
          secure: true,
        },
      }
    )
  );
  const router = useRouter();

  useEffect(() => {
    console.log('Layout - URL:', window.location.href);
    console.log('Layout - Hash:', window.location.hash);
    const { data: authListener } = supabaseClient.auth.onAuthStateChange(async (event, session) => {
      console.log('Layout - Auth Event:', event, 'Session:', session);
      if (event === 'SIGNED_IN' && session) {
        console.log('Layout - Checking metadata');
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (user?.user_metadata?.password_set === false && window.location.pathname !== '/update-password') {
          console.log('Layout - No password, redirecting to /update-password');
          router.push('/update-password');
        }
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6F4E37" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <SessionContextProvider supabaseClient={supabaseClient}>
          <AuthProvider>
            <AppProvider>
              {children}
              <Toaster />
            </AppProvider>
          </AuthProvider>
        </SessionContextProvider>
      </body>
    </html>
  );
}
