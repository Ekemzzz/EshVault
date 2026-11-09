import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthCard, AuthField, AuthMessage } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { isSupabaseConfigured } from '@/lib/supabase'
import * as auth from '@/services/auth.service'

import { usePageMeta } from '@/lib/seo'

export function ForgotPassword() {
  usePageMeta({ title: 'Reset password', noindex: true })
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [sent, setSent] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isSupabaseConfigured) {
      setError('Password reset is unavailable: no Supabase project is configured.')
      return
    }
    if (!email.trim()) {
      setError('Enter the email you signed up with.')
      return
    }
    setBusy(true)
    setError(undefined)
    auth
      .sendPasswordReset(email.trim())
      .then(() => setSent(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not send the reset email.')
        setBusy(false)
      })
  }

  if (sent) {
    return (
      <AuthCard
        title="Check your inbox"
        description={`If an account exists for ${email.trim()}, a reset link is on its way.`}
        footer={
          <p className="text-muted-foreground">
            Remembered it?{' '}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        }
      >
        <AuthMessage kind="success">
          Open the reset link in that email. It brings you straight back here to choose a new
          password. Links expire after a short time.
        </AuthMessage>
      </AuthCard>
    )
  }

  return (
    <AuthCard
      title="Reset your password"
      description="Enter your email and we’ll send you a reset link."
      footer={
        <p className="text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
        </p>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <AuthMessage kind="error">{error}</AuthMessage>}
        <AuthField
          label="Email"
          id="forgot-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? 'Sending…' : 'Send reset link'}
        </Button>
      </form>
    </AuthCard>
  )
}
