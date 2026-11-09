import { useEffect, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Lock,
  Pencil,
  Shield,
  Star,
  ThumbsUp,
  Trash2,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthField, AuthMessage, AuthTextArea } from '@/components/auth/AuthCard'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { ExtensionCard } from '@/components/extension/ExtensionCard'
import { BrowserLogo } from '@/components/common/BrowserLogo'
import { Container } from '@/components/ui/Container'
import { browsers as allBrowsers, categoryBySlug, formatCount } from '@/data/extensions'
import { pricingLabel } from '@/constants/filters'
import type {
  Extension,
  ExtensionFeature,
  ExtensionPermission,
  Review,
} from '@/types'
import { cn } from '@/utils/cn'

/* ==================== Overview ==================== */

interface OverviewProps {
  extension: Extension
  action?: ReactNode
}

export function OverviewSection({ extension, action }: OverviewProps) {
  const category = categoryBySlug(extension.category)
  return (
    <Container className="pt-5 xs:pt-6 sm:pt-8">
      <div className="flex items-start gap-3 xs:gap-4 sm:gap-6">
        <ExtensionIcon
          name={extension.name}
          slug={extension.slug}
          iconUrl={extension.iconUrl}
          className="h-14 w-14 shrink-0 xs:h-16 xs:w-16 sm:h-20 sm:w-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="accent">{category.label}</Badge>
          </div>
          <h1 className="mt-3 break-words text-[1.7rem] leading-[1.15] font-extrabold tracking-tight xs:text-3xl sm:text-4xl">
            {extension.name}
          </h1>
          <p className="mt-1 break-words text-base leading-snug text-muted-foreground xs:text-lg">
            {extension.tagline}
          </p>
          <p className="mt-4 max-w-3xl text-sm leading-relaxed text-foreground/80 xs:text-base">
            {extension.description}
          </p>
          {typeof extension.downloadCount === 'number' && (
            <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Download className="h-4 w-4" />
              {formatCount(extension.downloadCount)} installs
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </Container>
  )
}

/* ==================== Install Links ==================== */

interface InstallProps {
  extension: Extension
}

export function InstallationLinks({ extension }: InstallProps) {
  const links = extension.installLinks ?? []
  if (links.length === 0) {
    return (
      <section
        aria-labelledby="install-heading"
        className="rounded-2xl border border-border bg-card p-4 xs:p-5"
      >
        <h2 id="install-heading" className="text-lg font-semibold">
          Installation
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No store links have been recorded for this extension yet.
        </p>
      </section>
    )
  }
  return (
    <section aria-labelledby="install-heading" className="rounded-2xl border border-border bg-card p-4 xs:p-5">
      <h2 id="install-heading" className="text-lg font-semibold">
        Install for your browser
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-2 xs:grid-cols-2">
        {links.map((link) => {
          const meta = allBrowsers.find((b) => b.slug === link.browser)
          const label = meta ? `Get it on ${meta.label}` : 'Open store'
          return (
            <a
              key={link.browser}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              data-install-browser={link.browser}
              className={buttonStyles(
                'primary',
                'sm',
                // Full-width, 44px-tall store buttons on phones: the label
                //  alone (“Get it on Microsoft Edge”) would otherwise wrap the row awkwardly.
                'min-h-[44px] w-full justify-center whitespace-normal text-center xs:w-auto',
              )}
            >
              <BrowserLogo browser={link.browser} className="h-4 w-4" />
              {label}
              <ExternalLink className="h-3.5 w-3.5 opacity-70" />
            </a>
          )
        })}
      </div>
    </section>
  )
}

/* ==================== Browser compatibility ==================== */

interface CompatProps {
  supported: Extension['browsers']
}

export function BrowserCompatibilitySection({ supported }: CompatProps) {
  return (
    <section
      aria-labelledby="compat-heading"
      className="rounded-2xl border border-border bg-card p-4 xs:p-5"
    >
      <h2 id="compat-heading" className="text-lg font-semibold">
        Browser compatibility
      </h2>
      <ul className="mt-3 space-y-2">
        {allBrowsers.map((b) => {
          const ok = supported.includes(b.slug)
          return (
            <li
              key={b.slug}
              className="flex items-center justify-between gap-3 text-sm"
              data-browser-status={b.slug}
              data-supported={ok ? 'yes' : 'no'}
            >
              <span className="inline-flex items-center gap-2">
                <BrowserLogo
                  browser={b.slug}
                  className={cn('h-4 w-4', !ok && 'grayscale opacity-40')}
                />
                {b.label}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                )}
              >
                {ok ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Supported
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5" />
                    Not supported
                  </>
                )}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/* ==================== Features ==================== */

export function FeaturesSection({ features }: { features: ExtensionFeature[] }) {
  if (features.length === 0) return null
  return (
    <section aria-labelledby="features-heading" className="rounded-2xl border border-border bg-card p-4 xs:p-5">
      <h2 id="features-heading" className="text-lg font-semibold">
        Features
      </h2>
      <ul className="mt-3 space-y-3">
        {features.map((f, i) => (
          <li key={`${f.title}-${i}`} className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="font-medium leading-tight">{f.title}</p>
              {f.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{f.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ==================== Permissions / Privacy ==================== */

export function PrivacyPermissionsSection({ permissions }: { permissions: ExtensionPermission[] }) {
  if (permissions.length === 0) return null
  return (
    <section
      aria-labelledby="permissions-heading"
      className="rounded-2xl border border-border bg-card p-4 xs:p-5"
    >
      <h2 id="permissions-heading" className="flex items-center gap-2 text-lg font-semibold">
        <Shield className="h-4 w-4 text-primary" />
        Privacy & permissions
      </h2>
      <ul className="mt-3 space-y-3">
        {permissions.map((p, i) => (
          <li key={`${p.label}-${i}`} className="flex gap-3">
            <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Lock className="h-3.5 w-3.5" />
            </span>
            <div>
              <p className="text-sm font-medium">{p.label}</p>
              {p.description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{p.description}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

/* ==================== Pricing ==================== */

const PRICING_COPY: Record<NonNullable<Extension['pricing']>, string> = {
  free: 'Completely free to install and use.',
  freemium: 'Free tier available. Paid plans unlock additional features.',
  paid: 'Requires a one-time or subscription purchase.',
}

export function PricingSection({ pricing }: { pricing?: Extension['pricing'] }) {
  const p = pricing ?? 'free'
  return (
    <section aria-labelledby="pricing-heading" className="rounded-2xl border border-border bg-card p-4 xs:p-5">
      <h2 id="pricing-heading" className="text-lg font-semibold">
        Pricing
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant="accent">{pricingLabel(p)}</Badge>
        <span className="text-sm text-muted-foreground">{PRICING_COPY[p]}</span>
      </div>
    </section>
  )
}

/* ==================== Screenshots ==================== */

interface ScreenshotsProps {
  slug: string
  name: string
  /** Ready-to-render public URLs (resolved in the mapper), NOT storage paths. */
  urls: string[]
  count: number
}

export function ScreenshotsGallery({ slug, name, urls, count }: ScreenshotsProps) {
  const safeCount = Math.max(count, urls.length, 0)
  const items = Array.from({ length: safeCount }, (_, i) => i)
  const [active, setActive] = useState<number | null>(null)
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const open = active !== null

  // Escape closes the lightbox; arrow keys navigate. Rendered as plain DOM (no
  // AnimatePresence) so the dialog is never gated on rAF to complete an exit.
  // Keyed on the `open` boolean (not `active`) so arrow navigation neither
  // re-subscribes the listener nor steals focus from Prev/Next. Focus moves
  // into the dialog on open and returns to the opening tile on close, so
  // aria-modal is meaningful and keyboard users keep their place in the grid.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement as HTMLElement | null
    dialogRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      // Ignore keystrokes originating from editable fields (e.g. the header
      // search input) so arrow-key caret movement doesn't navigate the gallery.
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return
      if (e.key === 'Escape') setActive(null)
      else if (e.key === 'ArrowLeft')
        setActive((a) => (a === null ? a : (a - 1 + items.length) % items.length))
      else if (e.key === 'ArrowRight')
        setActive((a) => (a === null ? a : (a + 1) % items.length))
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      opener?.focus()
    }
  }, [open, items.length])

  if (items.length === 0) {
    return (
      <section
        aria-labelledby="screenshots-heading"
        className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground"
      >
        <h2 id="screenshots-heading" className="sr-only">
          Screenshots
        </h2>
        No screenshots yet.
      </section>
    )
  }

  return (
    <section aria-labelledby="screenshots-heading" className="rounded-2xl border border-border bg-card p-4 xs:p-5">
      <div className="flex items-baseline justify-between">
        <h2 id="screenshots-heading" className="text-lg font-semibold">
          Screenshots
        </h2>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {items.length} {items.length === 1 ? 'image' : 'images'}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => {
          const src = urls[i]
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className="focus-ring group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-muted/40"
              aria-label={`View screenshot ${i + 1} of ${name}`}
            >
              {src ? (
                <img
                  src={src}
                  alt={`${name} screenshot ${i + 1}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <PlaceholderImage slug={slug} index={i} className="h-full w-full" />
              )}
            </button>
          )
        })}
      </div>

      {open && (
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label={`Screenshot ${active + 1} of ${name}`}
          // Outer layer scrolls if content exceeds viewport, so controls stay
          // reachable on short windows. The centering wrapper uses min-h-full
          // to keep items vertically centered when they fit.
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 outline-none"
          onClick={() => setActive(null)}
        >
          <div className="flex min-h-full items-center justify-center p-2 xs:p-4">
            <div
              className="relative mx-auto w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close lives inside the media rect (not overflowing outside),
                  so it is never clipped when the dialog is taller than the
                  viewport on short windows. */}
              <button
                type="button"
                aria-label="Close"
                onClick={() => setActive(null)}
                className="focus-ring absolute right-1.5 top-1.5 z-10 grid h-11 w-11 place-items-center rounded-full bg-black/60 text-white shadow-md hover:bg-black/80 xs:right-2 xs:top-2 xs:h-9 xs:w-9"
              >
                <X className="h-4 w-4" />
              </button>
              {urls[active] ? (
                <img
                  src={urls[active]}
                  alt={`${name} enlarged screenshot ${active + 1}`}
                  className="mx-auto aspect-[16/10] max-h-[58vh] w-full rounded-xl bg-black object-contain xs:max-h-[70vh]"
                />
              ) : (
                <PlaceholderImage
                  slug={slug}
                  index={active}
                  className="mx-auto aspect-[16/10] max-h-[58vh] w-full rounded-xl xs:max-h-[70vh]"
                  large
                />
              )}

              <div className="mt-3 flex items-center justify-between gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] px-3 text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setActive((active - 1 + items.length) % items.length)}
                  disabled={items.length < 2}
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Prev
                </Button>
                <span className="text-xs text-foreground/70">
                  {active + 1} / {items.length}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="min-h-[44px] px-3 text-white hover:bg-white/15 hover:text-white"
                  onClick={() => setActive((active + 1) % items.length)}
                  disabled={items.length < 2}
                >
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

/** Deterministic inline placeholder for screenshot mock data. */
function PlaceholderImage({
  slug,
  index,
  className,
  large,
}: {
  slug: string
  index: number
  className?: string
  large?: boolean
}) {
  const svg = buildPlaceholderSvg(slug, index)
  return (
    <div
      data-screenshot-placeholder={slug}
      data-index={index}
      className={cn('block', className)}
      style={{
        backgroundImage: `url("${svg}")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      aria-hidden={!large}
    />
  )
}

function buildPlaceholderSvg(slug: string, index: number): string {
  const palettes = [
    ['#fef3c7', '#fdba74', '#7c2d12'],
    ['#e0e7ff', '#a5b4fc', '#312e81'],
    ['#fce7f3', '#f9a8d4', '#831843'],
    ['#dcfce7', '#86efac', '#14532d'],
    ['#fef9c3', '#fde047', '#713f12'],
  ]
  const [bg, accent, text] = palettes[(slug.length + index) % palettes.length]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0" stop-color="${bg}"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#g)"/>
    <rect x="40" y="40" width="560" height="40" rx="10" fill="#ffffff" opacity="0.85"/>
    <rect x="40" y="100" width="280" height="260" rx="14" fill="#ffffff" opacity="0.65"/>
    <rect x="340" y="100" width="260" height="120" rx="14" fill="#ffffff" opacity="0.65"/>
    <rect x="340" y="240" width="260" height="120" rx="14" fill="#ffffff" opacity="0.5"/>
    <text x="60" y="65" font-family="-apple-system, Segoe UI, Roboto, sans-serif" font-size="20" font-weight="700" fill="${text}">${slug.replace(/[^a-z0-9-]/gi, '')} · view ${index + 1}</text>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

/* ==================== Alternatives ==================== */

export function AlternativesSection({
  items,
}: {
  items: Extension[]
}) {
  if (items.length === 0) return null
  return (
    <section aria-labelledby="alternatives-heading" className="space-y-3">
      <h2 id="alternatives-heading" className="text-lg font-semibold">
        You might also like
      </h2>
      <div className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((ext) => (
          <ExtensionCard key={ext.id} extension={ext} />
        ))}
      </div>
    </section>
  )
}

/* ==================== Reviews ==================== */

/** Draft shape for creating/editing a review (mirrors service NewReviewInput). */
export interface ReviewDraft {
  rating: number
  title?: string
  body: string
}

interface ReviewsProps {
  reviews: Review[]
  /** Signed in AND Supabase configured, enables write/vote/edit/delete UI. */
  canInteract: boolean
  /** Supabase configured but signed out, show a sign-in call to action. */
  showSignIn: boolean
  onSubmit: (draft: ReviewDraft) => Promise<void>
  onUpdate: (id: string, draft: ReviewDraft) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onVote: (id: string, on: boolean) => Promise<void>
}

const MIN_REVIEW_BODY = 10

export function ReviewsSection({
  reviews,
  canInteract,
  showSignIn,
  onSubmit,
  onUpdate,
  onDelete,
  onVote,
}: ReviewsProps) {
  const location = useLocation()

  // Create form
  const [formOpen, setFormOpen] = useState(false)
  const [rating, setRating] = useState('5')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Inline edit (one review at a time) + two-step delete confirm
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState('5')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const [busyId, setBusyId] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  const errorText = (err: unknown, fallback: string) =>
    err instanceof Error ? err.message : fallback

  const submitReview = async (e: FormEvent) => {
    e.preventDefault()
    if (body.trim().length < MIN_REVIEW_BODY) {
      setFormError(`Please write at least ${MIN_REVIEW_BODY} characters.`)
      return
    }
    setSubmitting(true)
    setFormError(null)
    try {
      await onSubmit({ rating: Number(rating), title: title.trim() || undefined, body: body.trim() })
      setRating('5')
      setTitle('')
      setBody('')
      setFormOpen(false)
    } catch (err: unknown) {
      setFormError(errorText(err, 'Could not save your review.'))
    } finally {
      setSubmitting(false)
    }
  }

  const startEdit = (r: Review) => {
    setEditingId(r.id)
    setConfirmDeleteId(null)
    setFormError(null)
    setEditRating(String(r.rating))
    setEditTitle(r.title ?? '')
    setEditBody(r.body)
  }

  const saveEdit = async (id: string) => {
    if (editBody.trim().length < MIN_REVIEW_BODY) {
      setFormError(`Please write at least ${MIN_REVIEW_BODY} characters.`)
      return
    }
    setBusyId(id)
    setFormError(null)
    try {
      await onUpdate(id, {
        rating: Number(editRating),
        title: editTitle.trim() || undefined,
        body: editBody.trim(),
      })
      setEditingId(null)
    } catch (err: unknown) {
      setFormError(errorText(err, 'Could not update the review.'))
    } finally {
      setBusyId(null)
    }
  }

  const removeReview = async (id: string) => {
    setConfirmDeleteId(null)
    setBusyId(id)
    setFormError(null)
    try {
      await onDelete(id)
      if (editingId === id) setEditingId(null)
    } catch (err: unknown) {
      setFormError(errorText(err, 'Could not delete the review.'))
    } finally {
      setBusyId(null)
    }
  }

  const vote = async (r: Review) => {
    setBusyId(r.id)
    setFormError(null)
    try {
      await onVote(r.id, !r.isVoted)
    } catch (err: unknown) {
      setFormError(errorText(err, 'Could not record your vote.'))
    } finally {
      setBusyId(null)
    }
  }

  if (reviews.length === 0 && !canInteract && !showSignIn) {
    return (
      <section
        aria-labelledby="reviews-heading"
        className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground"
      >
        <h2 id="reviews-heading" className="sr-only">
          Reviews
        </h2>
        No reviews yet. Be the first to share what you think.
      </section>
    )
  }

  const avg = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0

  return (
    <section aria-labelledby="reviews-heading" className="rounded-2xl border border-border bg-card p-4 xs:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="reviews-heading" className="text-lg font-semibold">
          Reviews
        </h2>
        {reviews.length > 0 && (
          <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-medium text-foreground">{avg.toFixed(1)}</span>
            <span className="ml-1 text-xs">· {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}</span>
          </span>
        )}
      </div>

      {/* Write / sign-in prompt */}
      {(canInteract || showSignIn) && (
        <div className="mt-4">
          {canInteract && !formOpen && editingId === null && (
            <Button size="sm" variant="outline" onClick={() => { setFormOpen(true); setFormError(null) }}>
              Write a review
            </Button>
          )}
          {canInteract && formOpen && (
            <form onSubmit={submitReview} className="space-y-3 rounded-xl border border-border/60 bg-background p-4" noValidate>
              <div className="w-full max-w-[180px]">
                <RatingSelect id="review-rating" value={rating} onChange={setRating} />
              </div>
              <AuthField
                label="Title (optional)"
                id="review-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
              />
              <AuthTextArea
                label="Your review"
                id="review-body"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={2000}
                required
              />
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? 'Submitting…' : 'Submit review'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setFormOpen(false); setFormError(null) }}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
          {showSignIn && !canInteract && (
            <Link
              to="/login"
              state={{ from: location.pathname }}
              className={buttonStyles('outline', 'sm')}
            >
              Sign in to write a review
            </Link>
          )}
        </div>
      )}

      {formError && (
        <div className="mt-4">
          <AuthMessage kind="error">{formError}</AuthMessage>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">No reviews yet. Be the first to share what you think.</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-xl border border-border/60 bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {r.authorName}
                    {r.isMine && (
                      <span className="ml-2 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                        Your review
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Stars value={r.rating} />
              </div>
              {editingId === r.id ? (
                <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="w-full max-w-[180px]">
                    <RatingSelect id={`review-edit-rating-${r.id}`} value={editRating} onChange={setEditRating} />
                  </div>
                  <AuthField
                    label="Title"
                    id={`review-edit-title-${r.id}`}
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={120}
                  />
                  <AuthTextArea
                    label="Review"
                    id={`review-edit-body-${r.id}`}
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    maxLength={2000}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void saveEdit(r.id)} disabled={busyId === r.id}>
                      {busyId === r.id ? 'Saving…' : 'Save changes'}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  {r.title && <h3 className="mt-3 font-semibold leading-tight">{r.title}</h3>}
                  <p className="mt-2 text-sm text-muted-foreground">{r.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {canInteract && !r.isMine ? (
                      <button
                        type="button"
                        onClick={() => void vote(r)}
                        disabled={busyId === r.id}
                        aria-pressed={r.isVoted}
                        className={cn(
                          'focus-ring inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors disabled:opacity-50',
                          r.isVoted
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:text-foreground',
                        )}
                      >
                        <ThumbsUp className={cn('h-3.5 w-3.5', r.isVoted && 'fill-current')} />
                        Helpful ({r.helpfulCount ?? 0})
                      </button>
                    ) : (
                      (r.helpfulCount ?? 0) > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {r.helpfulCount} found this helpful
                        </span>
                      )
                    )}
                    {canInteract && r.isMine && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => startEdit(r)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                        </Button>
                        {confirmDeleteId === r.id ? (
                          <span className="inline-flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => void removeReview(r.id)}
                              disabled={busyId === r.id}
                            >
                              Confirm delete
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setConfirmDeleteId(null)}>
                              Keep
                            </Button>
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                            onClick={() => setConfirmDeleteId(r.id)}
                            disabled={busyId === r.id}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/** 1–5 star picker styled like the dashboard edit fields. */
function RatingSelect({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <>
      <label htmlFor={id} className="text-sm font-medium">
        Rating
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focus-ring mt-1 min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={String(n)}>
            {n} / 5
          </option>
        ))}
      </select>
    </>
  )
}

function Stars({ value }: { value: number }) {
  const v = Math.max(0, Math.min(5, value))
  return (
    <div className="inline-flex items-center gap-0.5" aria-label={`${v} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            'h-4 w-4',
            i < Math.round(v) ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/40',
          )}
        />
      ))}
    </div>
  )
}

/* ==================== Page-level helpers ==================== */

/**
 * `backTo` is the listing URL the visitor arrived from (e.g. /browse?page=3),
 * supplied by the card they clicked, so "Browse" returns them to that page.
 */
export function DetailBreadcrumb({ backTo }: { backTo?: string }) {
  return (
    <Container className="pt-6">
      <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-foreground">
              Home
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link to={backTo ?? '/browse'} className="hover:text-foreground">
              Browse
            </Link>
          </li>
        </ol>
      </nav>
    </Container>
  )
}

export function DetailNotFound({ slug }: { slug: string }) {
  return (
    <Container className="py-12 xs:py-16 text-center">
      <h1 className="text-2xl xs:text-3xl font-bold">Extension not found</h1>
      <p className="mt-2 text-muted-foreground">
        We could not find a published extension with the slug “{slug}”.
      </p>
      <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-2 xs:w-auto xs:flex-row xs:items-center xs:gap-2">
        <Link to="/browse" className={buttonStyles('primary', 'md', 'w-full xs:w-auto')}>
          Browse the directory
        </Link>
        <Link to="/categories" className={buttonStyles('outline', 'md', 'w-full xs:w-auto')}>
          See all categories
        </Link>
      </div>
    </Container>
  )
}
