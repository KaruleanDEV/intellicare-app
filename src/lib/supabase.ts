// src/lib/supabase.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';

// Initialize a *server-only* Supabase client
export const supabase: SupabaseClient = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
  // If you have a service role key for server-side operations that bypass RLS:
  // process.env.SUPABASE_SERVICE_ROLE_KEY || PUBLIC_SUPABASE_ANON_KEY
);