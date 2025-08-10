import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/supabase';

// This file is kept for simplicity, though the client is created in the layout.
// It can be used for components that need a client but are outside the main provider scope.
export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
