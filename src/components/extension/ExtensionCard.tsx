import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download } from 'lucide-react'
import type { Extension } from '@/types'
import { BrowserLogo } from '@/components/common/BrowserLogo'
import { ExtensionIcon } from './ExtensionIcon'
import { Badge } from '@/components/ui/Badge'
import { browsers as allBrowsers, categoryBySlug, formatCount } from '@/data/extensions'
import { fadeInUp } from '@/lib/motion'
import { useHoverCapable } from '@/hooks/useHoverCapable'
import { cn } from '@/utils/cn'

interface ExtensionCardProps {
  extension: Extension
  to?: string
  className?: string
}

export function ExtensionCard({ extension, to, className }: ExtensionCardProps) {
  const category = categoryBySlug(extension.category)
  const supported = allBrowsers.filter((b) => extension.browsers.includes(b.slug))
  const href = to ?? `/extensions/${extension.slug}`
  const location = useLocation()
  // Hand the listing URL (page, filters, sort) to the detail page so its
  // breadcrumb returns to this exact page instead of starting over at page 1.
  const fromListing =
    location.pathname === '/browse' || location.pathname.startsWith('/categories/')
      ? location.pathname + location.search
      : undefined
  // Phones latch `:hover` on tap, which would leave the card visibly lifted
  // after the user navigates back. Only animate the lift for real pointers.
  const hoverCapable = useHoverCapable()

  return (
    <motion.div
      variants={fadeInUp}
      whileHover={hoverCapable ? { y: -4 } : undefined}
      whileTap={{ scale: 0.99 }}
      className={cn('h-full', className)}
    >
      <Link
        to={href}
        state={fromListing ? { from: fromListing } : undefined}
        className={cn(
          'focus-ring group flex h-full flex-col gap-3 rounded-xl border border-border bg-card p-4 xs:p-5',
          'shadow-sm transition-shadow hover:shadow-md',
        )}
      >
        <div className="flex items-start gap-3">
          <ExtensionIcon name={extension.name} slug={extension.slug} iconUrl={extension.iconUrl} />
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold leading-tight group-hover:text-primary">
              {extension.name}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {extension.tagline}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{extension.description}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <Badge variant="secondary" className="min-w-0 overflow-hidden">
            <span className="block truncate">{category.label}</span>
          </Badge>
          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground xs:gap-3">
            <span className="flex items-center gap-1" title={`${supported.length} browsers`}>
              {supported.slice(0, 5).map((b) => (
                <BrowserLogo key={b.slug} browser={b.slug} className="h-3.5 w-3.5" />
              ))}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3.5 w-3.5" />
              {formatCount(extension.downloadCount)}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
