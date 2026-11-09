import { Link } from 'react-router-dom'
import { Package } from 'lucide-react'
import { cn } from '@/utils/cn'
import { env } from '@/lib/env'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        'group inline-flex min-w-0 items-center gap-2 font-semibold tracking-tight text-foreground',
        'focus-ring rounded-md',
        className,
      )}
      aria-label={`${env.appName} home page`}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
        <Package className="h-4 w-4" aria-hidden="true" />
      </span>
      {/* {Wordmark shrinks (then truncates) instead of pushing the header
          actions off-screen on 320–360px phones. /} */}
      <span className="min-w-0 truncate text-sm xs:text-base">EshVault</span>
    </Link>
  )
}
