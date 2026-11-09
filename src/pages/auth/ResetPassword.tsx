import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthCard, AuthField, AuthMessage } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import * as auth from '@/services/auth.service'

const MIN_PASSWORD = 8

// 
//   Reached after the user clicks a password-reset link (recovery session is
//   live) or from the profile page. Supabase only allows updateUser({password})
//   with an active session, which is why this route is protected.
//  
import { usePageMeta } from '@/lib/seo'

export function ResetPassword() {
  usePageMeta({ title: 'Choose a new password', noindex: true })
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [done, setDone] = useState(false)

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setError(`Password must be at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (password !== confirm) {
      setError('The two passwords do not match.')
      return
    }
    setBusy(true)
    setError(undefined)
    auth
      .updatePassword(password)
      .then(() => {
        setDone(true)
        setTimeout(() => navigate('/dashboard', { replace: true }), 1200)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Could not update your password.')
        setBusy(false)
      })
  }

  return (
    <AuthCard
      title="Choose a new password"
      description={
        done
          ? undefined
          : 'Your reset link worked. Pick a new password for your account.'
      }
      footer={
        <p className="text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Cancel and go to sign in
          </Link>
        </p>
      }
    >
      {done ? (
        <AuthMessage kind="success">
          Password updated. Redirecting you to your dashboard…
        </AuthMessage>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <AuthMessage kind="error">{error}</AuthMessage>}
          <AuthField
            label="New password"
            id="reset-password"
            type="password"
            autoComplete="new-password"
            required
            minLength={MIN_PASSWORD}
            hint={`At least ${MIN_PASSWORD} characters.`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthField
            label="Confirm new password"
            id="reset-password-confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      )}
    </AuthCard>
  )
}
