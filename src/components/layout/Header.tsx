import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, PlusCircle, Package } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonStyles } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { AccountMenu } from './AccountMenu'
import { Navigation } from './Navigation'
import { mainNavigation, submitNavItem } from '@/constants/navigation'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function Header() {
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { status, user, profile, signOut } = useAuth()

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  // Prevent background scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  // The drawer needs the page links plus the submit action, which lives
  // outside the nav row as a button on desktop.
  const drawerNavigation = [...mainNavigation, submitNavItem]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-16 items-center justify-between gap-2 sm:gap-4">
        <span className="inline-flex min-w-0 shrink-0 items-center gap-2 font-semibold tracking-tight text-foreground">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Package className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="min-w-0 truncate text-sm xs:text-base">EshVault</span>
        </span>

        <div className="flex shrink-0 items-center gap-1 xs:gap-2">
          <Navigation />

          <Link
            to={submitNavItem.to}
            className={cn(buttonStyles('primary', 'sm'), 'hidden md:inline-flex')}
          >
            <PlusCircle className="h-4 w-4" />
            Submit
          </Link>

          <AccountMenu className="hidden sm:block" />

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={cn(buttonStyles('ghost', 'icon'), 'h-11 w-11 xs:h-10 xs:w-10 md:hidden')}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      {/* Mobile drawer renders immediately (no height/opacity-gate animation)
          so it is always visible when open, even if frames are throttled. */}
      {open && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="max-h-[calc(100dvh_-_4rem_-_env(safe-area-inset-top))] overflow-y-auto border-t border-border/60 md:hidden"
        >
          <Container className="flex flex-col gap-1 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {drawerNavigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex min-h-[48px] items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.label}
              </NavLink>
            ))}

            {/* Account section (mobile) — mirrors the desktop AccountMenu. */}
            <div className="mt-2 border-t border-border/60 pt-2">
              {status === 'signed-in' ? (
                <>
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold">
                      {profile?.displayName ?? user?.displayName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <MobileAccountLink to="/dashboard">Dashboard</MobileAccountLink>
                  <MobileAccountLink to="/profile">Profile</MobileAccountLink>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false)
                      void signOut()
                    }}
                    className="flex min-h-[48px] w-full items-center rounded-md px-3 py-2.5 text-left text-base font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1 py-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={cn(buttonStyles('primary', 'sm'), 'flex-1 justify-center')}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={cn(buttonStyles('outline', 'sm'), 'flex-1 justify-center')}
                  >
                    Create account
                  </Link>
                </div>
              )}
            </div>
          </Container>
        </nav>
      )}
    </header>
  )
}

// 
//   Plain styled link for the mobile drawer account section. No onClick — the
//   location-change effect at the top of Header closes the drawer on nav.
//  

function MobileAccountLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex min-h-[48px] items-center rounded-md px-3 py-2.5 text-base font-medium text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
    >
      {children}
    </Link>
  )
}
