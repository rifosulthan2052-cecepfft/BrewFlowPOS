
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and anon key are required.');
}

// We will export a function that creates a new client for each request
// This ensures that the auth token is always fresh.
export const createSupabaseClient = (authToken?: string): SupabaseClient<Database> => {
    const headers: { [key: string]: string } = {
        'apikey': supabaseAnonKey,
    };
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    return createClient<Database>(supabaseUrl, supabaseAnonKey, {
        global: {
            headers,
        },
    });
};

// We can also export a default client for unauthenticated requests if needed
export const supabase = createSupabaseClient();
