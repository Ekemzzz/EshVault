//
//   Authentication service.
//  
//   Supabase-only by design: auth cannot be mocked, so unlike the read-oriented
//   services this module throws AuthUnavailableError when the project isn't configured.
//  Session persistence + refresh are handled by the Supabase
//   client (persistSession: true); this module is a thin, typed wrapper.
//  
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { AppUser, Profile } from '@/types'
import type { Database } from '@/types/database'
import { unwrap } from './errors'

// Thrown when an auth feature is used without a configured Supabase project.
export class AuthUnavailableError extends Error {
  constructor() {
    super('Authentication requires a configured Supabase project (.env).')
    this.name = 'AuthUnavailableError'
  }
}

// Auth errors carry the Supabase/PostgREST message; surfaced directly in forms.
export class AuthError extends Error {
  readonly code?: string
  constructor(message: string, code?: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

type ProfileRow = Database['public']['Tables']['profiles']['Row']

function requireConfigured() {
  if (!isSupabaseConfigured) throw new AuthUnavailableError()
}

function rethrow(err: { message?: string; code?: string } | null): void {
  if (err) throw new AuthError(err.message ?? 'Authentication failed', err.code ?? undefined)
}

/* ------------------------------ mappers ---------------------------------- */

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function displayNameFromUser(user: User): string {
  const fullName = user.user_metadata?.full_name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  return (user.email ?? 'user').split('@')[0]
}

export function toAppUser(user: User): AppUser {
  return {
    id: user.id,
    email: user.email ?? undefined,
    displayName: displayNameFromUser(user),
    // Mirrors the DB-side is_admin() check (migration 0002). Only a UX hint,
    // RLS re-verifies the JWT claim on every admin operation.
    isAdmin: user.app_metadata?.role === 'admin',
  }
}

/* ------------------------------ session ---------------------------------- */

export async function getSession(): Promise<Session | null> {
  requireConfigured()
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function getSessionUser(): Promise<AppUser | null> {
  const session = await getSession()
  return session?.user ? toAppUser(session.user) : null
}

// 
//   Subscribe to auth changes (sign in/out, token refresh, confirmation).
//   Returns an unsubscribe function.
//  
export function subscribeAuth(cb: (session: Session | null) => void): () => void {
  requireConfigured()
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session))
  return () => data.subscription.unsubscribe()
}

/* ------------------------------ flows ------------------------------------ */

export interface SignUpResult {
  // 
  //   True when the project requires email confirmation: no session is issued
  //   until the user clicks the emailed link. When "Confirm email" is OFF (the
  //   dev fallback), the user is signed in immediately and this is false.
  //  
  requiresConfirmation: boolean
}

export async function signUp(email: string, password: string, fullName: string): Promise<SignUpResult> {
  requireConfigured()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  rethrow(error)
  // No user means the request was rejected silently, treat as failure.
  if (!data.user) throw new AuthError('Registration failed. Please try again.')
  return { requiresConfirmation: data.session == null }
}

export async function signIn(email: string, password: string): Promise<AppUser> {
  requireConfigured()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  rethrow(error)
  if (!data.session) throw new AuthError('Check your inbox. Confirm your email to finish signing in.')
  return toAppUser(data.session.user)
}

export async function signOut(): Promise<void> {
  requireConfigured()
  const { error } = await supabase.auth.signOut()
  rethrow(error)
}

/** Sends a password-reset email; always "succeeds" (no account enumeration). */
export async function sendPasswordReset(email: string): Promise<void> {
  requireConfigured()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
  })
  rethrow(error)
}

// 
//   Set a new password for the signed-in user. Used by both the recovery flow
//   (after clicking a reset link, the session is a recovery session) and the profile page.
//  
export async function updatePassword(newPassword: string): Promise<void> {
  requireConfigured()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  rethrow(error)
}

/* ------------------------------ profile ----------------------------------- */

// Load the signed-in user's profile (RLS: owner or admin only).
export async function getMyProfile(): Promise<Profile | null> {
  requireConfigured()
  const user = await getSessionUser()
  if (!user) return null
  const row = unwrap(
    await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
  ) as ProfileRow | null
  return row ? mapProfile(row) : null
}

export interface ProfilePatch {
  displayName?: string
  avatarUrl?: string | null
  bio?: string | null
}

// Upsert-safe profile edit: patches only provided fields on the owner's row. 
export async function updateMyProfile(patch: ProfilePatch): Promise<Profile> {
  requireConfigured()
  const user = await getSessionUser()
  if (!user) throw new AuthError('You must be signed in to edit your profile.')

  // The row is created by the signup trigger; upsert covers the rare case
  // where the trigger hasn't run yet (e.g. users created before Phase 6).
  // Unspecified optional columns are omitted, so an existing avatar/bio is never accidentally blanked.
  const values: Database['public']['Tables']['profiles']['Insert'] = {
    id: user.id,
    display_name: patch.displayName ?? user.displayName,
    ...(patch.avatarUrl !== undefined ? { avatar_url: patch.avatarUrl } : {}),
    ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
  }

  const row = unwrap(
    await supabase.from('profiles').upsert(values, { onConflict: 'id' }).select('*').single(),
  ) as ProfileRow
  return mapProfile(row)
}
