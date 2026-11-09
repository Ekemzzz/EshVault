//
//   AuthProvider...
//   Single source of truth for the signed-in user + profile. Mirrors the
//   Supabase session (which is itself persisted/refreshed automatically) and
//   keeps a lightweight profile copy for the header / forms. Mounted around the
//   router in App.tsx so every route (and the Header) can read it.
//  
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppUser, Profile } from '@/types'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as auth from '@/services/auth.service'

export type AuthStatus = 'loading' | 'signed-in' | 'signed-out'

interface AuthContextValue {
  status: AuthStatus
  user: AppUser | null
  profile: Profile | null
  isSignedIn: boolean
  refresh: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(isSupabaseConfigured ? 'loading' : 'signed-out')
  const [user, setUser] = useState<AppUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  const load = useCallback(async (appUser: AppUser | null) => {
    setUser(appUser)
    if (!appUser) {
      setProfile(null)
      return
    }
    try {
      setProfile(await auth.getMyProfile())
    } catch {
      // Profile read failure is non-fatal to auth state; leave it null.
      setProfile(null)
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus('signed-out')
      return
    }
    let cancelled = false

    const applySession = async (session: import('@supabase/supabase-js').Session | null) => {
      if (cancelled) return
      const appUser = session?.user ? auth.toAppUser(session.user) : null
      await load(appUser)
      if (!cancelled) setStatus(appUser ? 'signed-in' : 'signed-out')
    }

    // Initial hydrate from the persisted session, then subscribe to changes.
    void auth
      .getSession()
      .then(applySession)
      .catch(() => !cancelled && setStatus('signed-out'))

    let unsubscribe: (() => void) | undefined
    try {
      unsubscribe = auth.subscribeAuth((session) => void applySession(session))
    } catch {
      //  subscribeAuth throws only when unconfigured, already handled above.
    }
    return () => {
      cancelled = true
      unsubscribe?.()
    }
  }, [load])

  const refresh = useCallback(async () => {
    await load(await auth.getSessionUser())
  }, [load])

  const signOut = useCallback(async () => {
    await auth.signOut()
    await load(null)
    setStatus('signed-out')
  }, [load])

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, profile, isSignedIn: status === 'signed-in', refresh, signOut }),
    [status, user, profile, refresh, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
