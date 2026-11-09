// 
//   AccountMenu: header control.
//   Signed out: "Sign in" button. Signed in: avatar + dropdown (dashboard,
//   profile, sign out). Closes on outside click and Escape.
//  
import { useEffect, useRef, useState } from 'react'
import type { ComponentType, ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutDashboard, LogOut, ShieldCheck, Upload, UserRound } from 'lucide-react'
import { buttonStyles } from '@/components/ui/Button'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/utils/cn'

export function AccountMenu({ className }: { className?: string }) {
  const { status, user, profile, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (status === 'loading') {
    return <div className={cn('h-9 w-9 animate-pulse rounded-full bg-muted', className)} aria-hidden />
  }

  if (status === 'signed-out') {
    return (
      <Link to="/login" className={cn(buttonStyles('outline', 'sm'), className)}>
        Sign in
      </Link>
    )
  }

  const name = profile?.displayName ?? user?.displayName ?? 'You'

  const onSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/')
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          'focus-ring inline-flex min-h-[44px] min-w-[44px] items-center gap-2 rounded-full border border-border bg-card px-1.5 pr-3',
          'transition-colors hover:bg-accent/60',
        )}
      >
        <ExtensionIcon
          name={name}
          slug={user?.id ?? 'me'}
          iconUrl={profile?.avatarUrl}
          className="h-8 w-8"
        />
        <span className="hidden max-w-[10ch] truncate text-sm font-medium sm:inline">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-border bg-card shadow-lg"
        >
          <div className="border-b border-border px-4 py-3">
            <p className="truncate text-sm font-semibold">{name}</p>
            {user?.email && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <MenuLink to="/dashboard" onClick={() => setOpen(false)} icon={LayoutDashboard}>
            Dashboard
          </MenuLink>
          <MenuLink to="/submissions" onClick={() => setOpen(false)} icon={Upload}>
            My submissions
          </MenuLink>
          {user?.isAdmin && (
            <MenuLink to="/admin" onClick={() => setOpen(false)} icon={ShieldCheck}>
              Admin
            </MenuLink>
          )}
          <MenuLink to="/profile" onClick={() => setOpen(false)} icon={UserRound}>
            Profile
          </MenuLink>
          <button
            type="button"
            role="menuitem"
            onClick={() => void onSignOut()}
            className="focus-ring flex min-h-[44px] w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  icon: Icon,
  onClick,
  children,
}: {
  to: string
  icon: ComponentType<{ className?: string }>
  onClick: () => void
  children: ReactNode
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="focus-ring flex min-h-[44px] items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
      {children}
    </Link>
  )
}
