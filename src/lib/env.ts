// 
//   Centralised, typed access to Vite environment variables.
//   Keeps `import.meta.env` usage in one place and provides safe defaults.
//  
export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? '',
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
  appName: import.meta.env.VITE_APP_NAME ?? 'EshVault',
  isDev: import.meta.env.DEV,
} as const

// 
//   True only when real Supabase credentials have been supplied.
//   When false the app still boots and the client initialises against a
//   placeholder, but data features should be treated as unavailable.
// 
export const isSupabaseConfigured =
  env.supabaseUrl.length > 0 &&
  env.supabaseAnonKey.length > 0 &&
  !env.supabaseUrl.includes('placeholder')
