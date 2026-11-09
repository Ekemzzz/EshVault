import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { Bookmark, BookmarkCheck } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { CompareToggle } from '@/components/compare/CompareToggle'
import {
  AlternativesSection,
  BrowserCompatibilitySection,
  DetailBreadcrumb,
  DetailNotFound,
  FeaturesSection,
  InstallationLinks,
  OverviewSection,
  PricingSection,
  PrivacyPermissionsSection,
  ReviewsSection,
  ScreenshotsGallery,
} from '@/components/detail/Sections'
import {
  createReview,
  deleteReview,
  getAlternatives,
  getExtensionBySlug,
  getReviews,
  setHelpfulVote,
  updateReview,
} from '@/services/extensions.service'
import { getSavedIds, toggleSaved } from '@/services/saved.service'
import { screenshotCountBySlug } from '@/data/extensionDetails'
import { isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { Extension, Review } from '@/types'

interface Data {
  extension: Extension | null
  reviews: Review[]
  alternatives: Extension[]
}

import { usePageMeta } from '@/lib/seo'

export function ExtensionDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { status } = useAuth()
  const [data, setData] = useState<Data | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)
  const [saved, setSaved] = useState(false)
  const [saveBusy, setSaveBusy] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Per-extension document title/description + social preview card once loaded.
  const detail = data?.extension
  usePageMeta({
    title: detail ? detail.name : 'Extension',
    description: detail?.tagline ?? 'Details, reviews and install links for this browser extension.',
    image: detail?.iconUrl,
    type: 'article',
    noindex: !detail,
  })

  useEffect(() => {
    let cancelled = false
    setData(undefined)
    setError(undefined)
    setSaved(false)
    setSaveError(null)
    Promise.all([getExtensionBySlug(slug), getReviews(slug), getAlternatives(slug)])
      .then(([ext, revs, alts]) => {
        if (cancelled) return
        setData({ extension: ext, reviews: revs, alternatives: alts })
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : String(err))
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  // getReviews embeds viewer state (isMine / isVoted), which is only correct
  // once the auth session has hydrated, refresh the list when status settles.
  useEffect(() => {
    if (status === 'loading') return
    let cancelled = false
    getReviews(slug)
      .then((revs) => {
        if (!cancelled) setData((d) => (d ? { ...d, reviews: revs } : d))
      })
      .catch(() => {
      })
    return () => {
      cancelled = true
    }
  }, [slug, status])

  const reloadReviews = useCallback(async () => {
    const revs = await getReviews(slug)
    setData((d) => (d ? { ...d, reviews: revs } : d))
  }, [slug])

  const extensionId = data?.extension?.id
  const signedIn = status === 'signed-in'

  // Reflect the user's saved state on this page only after a session exists.
  useEffect(() => {
    if (!isSupabaseConfigured || !signedIn || !extensionId) {
      setSaved(false)
      return
    }
    let cancelled = false
    getSavedIds()
      .then((ids) => {
        if (!cancelled) setSaved(ids.has(extensionId))
      })
      .catch(() => {
      })
    return () => {
      cancelled = true
    }
  }, [signedIn, extensionId])

  const onSave = async () => {
    if (!data?.extension) return
    if (!signedIn) {
      // Remember where they were so Login sends them back after sign-in.
      setSaveError(null)
      navigate('/login', { state: { from: location.pathname } })
      return
    }
    setSaveBusy(true)
    setSaveError(null)
    try {
      setSaved(await toggleSaved(data.extension.id))
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Could not update your saved list.')
    } finally {
      setSaveBusy(false)
    }
  }

  if (error) {
    return (
      <Container className="py-12 xs:py-16 text-center">
        <h1 className="text-2xl font-bold xs:text-3xl">Something went wrong</h1>
        <p className="mt-2 break-words text-muted-foreground">{error}</p>
      </Container>
    )
  }

  if (data === undefined) {
    return (
      <Container className="py-12 xs:py-16 text-center text-muted-foreground">
        Loading extension…
      </Container>
    )
  }

  if (data.extension === null) {
    return <DetailNotFound slug={slug} />
  }

  const ext = data.extension
  // Set by the card the visitor clicked: the listing URL, page and filters included.
  const backTo = (location.state as { from?: string } | null)?.from
  // The mapper already resolves ready-to-render public URLs; never re-derive
  // storage paths from them. Placeholder counts only apply in mock mode, a
  // configured DB with no screenshot rows must show the honest empty state.
  const screenshotUrls = ext.screenshotUrls ?? []
  const screenshotCount = isSupabaseConfigured
    ? screenshotUrls.length
    : Math.max(screenshotUrls.length, screenshotCountBySlug[ext.slug] ?? 0)

  // Saving is per-user data, so the button only exists with Supabase connected.
  // Comparison is client-side, so its toggle renders in every mode.
  const saveAction = (
    <div className="flex flex-col items-end gap-2">
      <CompareToggle slug={ext.slug} name={ext.name} iconUrl={ext.iconUrl} />
      {isSupabaseConfigured && (
        <div className="flex flex-col items-end gap-1">
          <Button
            variant={saved ? 'primary' : 'outline'}
            size="sm"
            onClick={() => void onSave()}
            disabled={saveBusy}
            aria-pressed={saved}
          >
            {saved ? <BookmarkCheck className="mr-1 h-4 w-4" /> : <Bookmark className="mr-1 h-4 w-4" />}
            {saved ? 'Saved' : 'Save'}
          </Button>
          {saveError && <p role="alert" className="max-w-[160px] text-right text-xs text-red-600">{saveError}</p>}
        </div>
      )}
    </div>
  )

  return (
    <>
      <DetailBreadcrumb backTo={backTo} />
      <OverviewSection extension={ext} action={saveAction} />

      <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
        <div className="grid grid-cols-1 gap-4 xs:gap-5 lg:gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {/* Main column */}
          <div className="min-w-0 space-y-4 xs:space-y-5 sm:space-y-6">
            <ScreenshotsGallery
              slug={ext.slug}
              name={ext.name}
              urls={screenshotUrls}
              count={screenshotCount}
            />
            <FeaturesSection features={ext.features ?? []} />
            <PrivacyPermissionsSection permissions={ext.permissions ?? []} />
            <ReviewsSection
              reviews={data.reviews}
              canInteract={signedIn && isSupabaseConfigured}
              showSignIn={status === 'signed-out' && isSupabaseConfigured}
              onSubmit={async (draft) => {
                await createReview(ext.slug, draft)
                await reloadReviews()
              }}
              onUpdate={async (id, draft) => {
                await updateReview(id, draft)
                await reloadReviews()
              }}
              onDelete={async (id) => {
                await deleteReview(id)
                await reloadReviews()
              }}
              onVote={async (id, on) => {
                await setHelpfulVote(id, on)
                await reloadReviews()
              }}
            />
          </div>

          {/* Sidebar */}
          <aside className="min-w-0 space-y-4 xs:space-y-5 lg:sticky lg:top-24 lg:self-start lg:space-y-6">
            <InstallationLinks extension={ext} />
            <BrowserCompatibilitySection supported={ext.browsers} />
            <PricingSection pricing={ext.pricing} />
          </aside>
        </div>

        <div className="mt-8 xs:mt-10">
          <AlternativesSection items={data.alternatives} />
        </div>
      </Container>
    </>
  )
}
