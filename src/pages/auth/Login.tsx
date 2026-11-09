import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { AuthCard, AuthField, AuthMessage } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as auth from '@/services/auth.service'

import { usePageMeta } from '@/lib/seo'

export function Login() {
  usePageMeta({ title: 'Sign in', noindex: true })
  const { status } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  // Already signed in? Skip the form.
  if (status === 'signed-in') {
    return <Navigate to={from} replace />
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Sign-in is unavailable: no Supabase project is configured.')
      return
    }
    if (!email.trim() || !password) {
      setError('Enter your email and password.')
      return
    }
    setBusy(true)
    setError(undefined)
    auth
      .signIn(email.trim(), password)
      .then(() => navigate(from, { replace: true }))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.')
        setBusy(false)
      })
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to save extensions, write reviews and vote on reviews."
      footer={
        <p className="text-muted-foreground">
          New here?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create an account
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <AuthMessage kind="error">{error}</AuthMessage>}
        <AuthField
          label="Email"
          id="login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          id="login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between gap-3">
          <Link to="/forgot-password" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
            Forgot password?
          </Link>
          <Button type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>
    </AuthCard>
  )
}
