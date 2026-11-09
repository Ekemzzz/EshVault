//  potectedRoute.
 
//  Gates a route behind an active session. While the initial session hydrate
//  is in flight it renders a neutral loader (no motion gate) so we never
//  bounce a returning user to /login before their persisted session resolves.
 

import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Container } from '@/components/ui/Container'
import { useAuth } from '@/hooks/useAuth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return (
      <Container className="py-12 xs:py-16 text-center text-muted-foreground">
        Loading your session…
      </Container>
    )
  }

  if (status !== 'signed-in') {
    // Remember where they were headed so /login can redirect back.
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }

  return <>{children}</>
}
