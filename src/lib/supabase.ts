import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env, isSupabaseConfigured } from './env'

//
//   Fallback values keep `createClient` from throwing when credentials are
//   absent, so the application can still boot during early development.
//   Real projects should set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in `.env`.
//  
const supabaseUrl = env.supabaseUrl || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = env.supabaseAnonKey || 'public-anon-placeholder-key'

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: { 'x-application-name': env.appName },
    },
  },
)

export { isSupabaseConfigured }
