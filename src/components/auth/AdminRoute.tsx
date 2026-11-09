
  // AdminRoute.
 
  // Client-side gate for /admin: waits for the session hydrate, bounces anonymous
  // visitors through /login, and shows a plain "administrators only" panel for
  // signed-in non-admins. 
 

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'

export function AdminRoute({ children }: { children: ReactNode }) {
  const { status, user } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <Container className="py-12 xs:py-16 text-center text-muted-foreground">
        Loading your session…
      </Container>
    )
  }

  if (status !== 'signed-in') {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  if (!user?.isAdmin) {
    return (
      <Container className="py-10 xs:py-14">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
          <ShieldAlert className="mx-auto h-8 w-8 text-muted-foreground" />
          <h1 className="mt-3 text-xl font-bold tracking-tight">Administrators only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This dashboard requires an admin role on your account. Signed in as{' '}
            <span className="font-medium text-foreground">{user?.email ?? user?.displayName}</span>
            {'. Ask a site administrator to grant your account the admin role.'}
          </p>
        </div>
      </Container>
    )
  }

  return <>{children}</>
}
