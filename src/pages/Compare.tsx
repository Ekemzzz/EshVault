// 
//   Compare: side-by-side comparison page.
//  
//   Slug source of truth: ?slugs=a,b,c (shareable) with a fallback to the
//   persisted tray. Works fully signed-out; removing a column updates both the
//   URL and the tray. Includes an alternatives-discovery strip per extension.
//  
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/common/PageHeader'
import { AuthMessage } from '@/components/auth/AuthCard'
import { buttonStyles } from '@/components/ui/Button'
import { CompareTable } from '@/components/compare/CompareTable'
import { CompareToggle } from '@/components/compare/CompareToggle'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { MAX_COMPARE, useCompare } from '@/hooks/useCompare'
import { getAlternatives, getExtensionBySlug } from '@/services/extensions.service'
import { cn } from '@/utils/cn'
import type { Extension } from '@/types'

const MAX_ROWS = 3 // URL slugs are deduped + capped to the tray limit

function parseSlugs(raw: string | null): string[] {
  if (!raw) return []
  return [...new Set(raw.split(',').map((s) => s.trim()).filter(Boolean))].slice(0, MAX_ROWS)
}

import { usePageMeta } from '@/lib/seo'

export function Compare() {
  usePageMeta({
    title: 'Compare extensions',
    description: 'Line up to three browser extensions side by side and spot the differences.',
    noindex: true, // selection lives in the query string, not indexable content
  })
  const [params, setParams] = useSearchParams()
  const { entries: trayEntries, slugs: traySlugs, remove } = useCompare()

  // Explicit URL wins; otherwise mirror the saved tray (survives reloads).
  const slugs = useMemo(() => {
    const fromUrl = parseSlugs(params.get('slugs'))
    return fromUrl.length > 0 ? fromUrl : traySlugs
  }, [params, traySlugs])
  const key = slugs.join(',')

  const [items, setItems] = useState<Extension[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const [loading, setLoading] = useState(slugs.length > 0)
  const [error, setError] = useState<string | undefined>(undefined)
  const [differencesOnly, setDifferencesOnly] = useState(false)

  // Alternatives per compared extension (discovery strips below the table).
  const [alternatives, setAlternatives] = useState<{ slug: string; name: string; alts: Extension[] }[]>([])

  useEffect(() => {
    if (slugs.length === 0) {
      setItems([])
      setMissing([])
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(undefined)
    Promise.all(slugs.map((s) => getExtensionBySlug(s)))
      .then((results) => {
        if (cancelled) return
        const found = results.filter((r): r is Extension => !!r)
        const notFound = slugs.filter((_, i) => !results[i]).slice(0, MAX_ROWS)
        setItems(found)
        setMissing(notFound)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Could not load the comparison.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
      return () => {
        cancelled = true
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  useEffect(() => {
    if (items.length === 0) {
      setAlternatives([])
      return
    }
    let cancelled = false
    Promise.all(items.map((ext) => getAlternatives(ext.slug, 3).then((alts) => ({ slug: ext.slug, name: ext.name, alts }))))
      .then((rows) => {
        if (!cancelled) setAlternatives(rows)
      })
      .catch(() => {
      })
    return () => {
      cancelled = true
    }
  }, [items])

  const onRemove = (slug: string) => {
    remove(slug)
    // Keep a shareable URL in sync when it was the source; once empty the
    // page falls back to (a smaller) tray.
    if (params.has('slugs')) {
      const next = slugs.filter((s) => s !== slug)
      if (next.length > 0) setParams({ slugs: next.join(',') })
      else setParams({})
    }
  }

  // Empty tray, no URL: friendly starting point.
  if (!loading && slugs.length === 0) {
    return (
      <Container className="py-12 xs:py-16">
        <PageHeader
          eyebrow="Compare"
          title="Nothing selected yet"
          description="Pick up to three extensions from the directory and we'll line them up side by side."
        />
        <div className="mt-6 flex flex-col items-start gap-3 xs:flex-row xs:items-center">
          <Link to="/browse" className={buttonStyles('primary', 'sm')}>
            Browse extensions
          </Link>
          {trayEntries.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Your saved selection is empty. It stays in this browser and works whether you're signed in or not.
            </p>
          )}
        </div>
      </Container>
    )
  }

  return (
    <>
      <Container className="pt-6 xs:pt-8">
        <PageHeader
          eyebrow="Compare"
          title="Side-by-side comparison"
          description={`Up to ${MAX_COMPARE} extensions at a time. Identical rows are dimmed; unique values are highlighted.`}
        />
        <label
          className={cn(
            'focus-ring mt-4 inline-flex min-h-[44px] cursor-pointer select-none items-center gap-2 rounded-md px-1 text-sm',
            'text-muted-foreground transition-colors hover:text-foreground',
          )}
        >
          <input
            type="checkbox"
            checked={differencesOnly}
            onChange={(e) => setDifferencesOnly(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Show differences only
        </label>
      </Container>

      <Container className="pb-10 xs:pb-14">
        {error && (
          <div className="mb-5">
            <AuthMessage kind="error">{error}</AuthMessage>
          </div>
        )}
        {missing.length > 0 && (
          <div className="mb-5">
            <AuthMessage kind="error">
              Could not find: {missing.join(', ')}. They may have been removed from the directory.
            </AuthMessage>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading comparison…</p>
        ) : items.length > 0 ? (
          <>
            {items.length < 2 && (
              <p className="mb-4 text-sm text-muted-foreground">
                Add at least one more extension to see meaningful differences.{' '}
                <Link to="/browse" className="font-medium text-primary hover:underline">
                  Browse the directory
                </Link>
              </p>
            )}
            <CompareTable
              items={items}
              diffable={items.length >= 2}
              differencesOnly={differencesOnly}
              onRemove={onRemove}
            />

            {/* Alternatives discovery: similar tools for each compared pick. */}
            {alternatives
              .filter((a) => a.alts.length > 0)
              .map(({ slug, name, alts }) => (
                <section key={slug} aria-labelledby={`alts-${slug}`} className="mt-8 xs:mt-10">
                  <h2 id={`alts-${slug}`} className="text-lg font-semibold">
                    Similar to{' '}
                    <Link to={`/extensions/${slug}`} className="hover:text-primary hover:underline">
                      {name}
                    </Link>
                  </h2>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {alts.map((alt) => (
                      <li
                        key={alt.id}
                        className="flex h-11 items-center gap-2 rounded-full border border-border bg-card pl-2 pr-1.5"
                      >
                        <ExtensionIcon name={alt.name} slug={alt.slug} iconUrl={alt.iconUrl} className="h-7 w-7 shrink-0" />
                        <Link
                          to={`/extensions/${alt.slug}`}
                          className="focus-ring max-w-[18ch] truncate rounded-md text-sm font-medium hover:text-primary hover:underline"
                        >
                          {alt.name}
                        </Link>
                        <CompareToggle slug={alt.slug} name={alt.name} iconUrl={alt.iconUrl} mini />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
          </>
        ) : null}
      </Container>
    </>
  )
}
