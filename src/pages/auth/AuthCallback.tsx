import { useEffect } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { AuthCard, AuthMessage } from '@/components/auth/AuthCard'
import { useAuth } from '@/hooks/useAuth'

// 
//   Landing target for email confirmation + password-reset links.
//   supabase-js (detectSessionInUrl) consumes the tokens from the URL fragment
//   automatically; the AuthProvider then flips status. This page just waits and
//  routes: recovery → /reset-password, confirmation → /dashboard.
//  
import { usePageMeta } from '@/lib/seo'

export function AuthCallback() {
  usePageMeta({ title: 'Finishing sign-in', noindex: true })
  const { status } = useAuth()
  const [searchParams] = useSearchParams()
  const isRecovery = searchParams.get('type') === 'recovery'

  // Ensure the client processes any pending URL hash even if this component
  // mounted before the initial session hydrate.
  useEffect(() => {
    document.title = 'Confirming…'
  }, [])

  if (status === 'loading') {
    return (
      <AuthCard title="Finishing sign-in…" description="Verifying your link, one moment.">
        <p className="text-sm text-muted-foreground">This should only take a second.</p>
      </AuthCard>
    )
  }

  if (status === 'signed-in') {
    return <Navigate to={isRecovery ? '/reset-password' : '/dashboard'} replace />
  }

  return (
    <AuthCard
      title="Link expired"
      description="This confirmation or reset link is no longer valid."
      footer={
        <p className="text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">
            Back to sign in
          </Link>
          {' · '}
          <Link to="/forgot-password" className="font-medium text-primary hover:underline">
            Send a new link
          </Link>
        </p>
      }
    >
      <AuthMessage kind="error">
        Links expire after a short time for security. Request a fresh one and try again.
      </AuthMessage>
    </AuthCard>
  )
}
