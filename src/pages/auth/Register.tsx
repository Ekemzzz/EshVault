import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { AuthCard, AuthField, AuthMessage } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as auth from '@/services/auth.service'

const MIN_PASSWORD = 8

import { usePageMeta } from '@/lib/seo'

export function Register() {
  usePageMeta({ title: 'Create an account', noindex: true })
  const { status } = useAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [sent, setSent] = useState(false)

  if (status === 'signed-in') {
    return <Navigate to="/dashboard" replace />
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Registration is unavailable: no Supabase project is configured.')
      return
    }
    if (!fullName.trim()) {
      setError('Please add a display name.')
      return
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    setBusy(true)
    setError(undefined)
    auth
      .signUp(email.trim(), password, fullName.trim())
      .then(({ requiresConfirmation }) => {
        // Dev fallback: with "Confirm email" OFF the session is already live
        // and the AuthProvider subscription flips us to signed-in; the
        // <Navigate> above takes over. With confirmation ON we show the
        // "check your inbox" state instead.
        if (requiresConfirmation) setSent(true)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Registration failed. Please try again.')
        setBusy(false)
      })
  }

  if (sent) {
    return (
      <AuthCard
        title="Confirm your email"
        description="We sent a confirmation link to your inbox."
        footer={
          <p className="text-muted-foreground">
            Already confirmed?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        }
      >
        <AuthMessage kind="success">
          Click the link in that email to finish creating your account, then sign in.
        </AuthMessage>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Create your account"
      description="Save extensions, write reviews and help others choose."
      footer={
        <p className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <AuthMessage kind="error">{error}</AuthMessage>}
        <AuthField
          label="Display name"
          id="register-name"
          autoComplete="name"
          placeholder="e.g. Alex Rivera"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <AuthField
          label="Email"
          id="register-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <AuthField
          label="Password"
          id="register-password"
          type="password"
          autoComplete="new-password"
          required
          minLength={MIN_PASSWORD}
          hint={`At least ${MIN_PASSWORD} characters.`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthCard>
  )
}
