import { useEffect, useState } from 'react'
import { ChevronDown, Search, SlidersHorizontal, X } from 'lucide-react'
import { Button, buttonStyles } from '@/components/ui/Button'
import type { ExploreFilters, SortKey } from '@/services/extensions.service'
import type { Pricing } from '@/types'
import {
  pricingOptions,
  sortOptions,
} from '@/constants/filters'
import { cn } from '@/utils/cn'

interface FilterBarProps {
  filters: ExploreFilters
  sort: SortKey
  categories: { slug: string; label: string }[]
  browsers: { slug: string; label: string }[]
  setFilter: (patch: Partial<ExploreFilters>) => void
  setSort: (s: SortKey) => void
  reset: () => void
  hasActiveFilters: boolean
  lockedCategory?: boolean
  className?: string
}

// 
//  Selects always fill their column so the filter row spreads evenly acrossthe card.
//  Breakpoints: 1 col (mobile), 2 cols (xs/sm), 3 cols (md), 4 cols (lg+),
//  four fields sit side by side on desktop with the Clear button wrapping onto its own row, right-aligned.
//   Height grows to 44px on touch so every control is a comfortable target.
//  
const selectClass =
  'h-11 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 sm:h-10'

export function FilterBar({
  filters,
  sort,
  categories,
  browsers,
  setFilter,
  setSort,
  reset,
  hasActiveFilters,
  lockedCategory,
  className,
}: FilterBarProps) {
  const [localQ, setLocalQ] = useState(filters.q ?? '')

  // Dropdowns are collapsed behind a toggle on phones (they would otherwise
  // stack into a wall of controls); always visible from `sm` up.
  const activeSelectCount = [
    filters.category,
    filters.browser,
    filters.pricing,
  ].filter((v) => v !== undefined && v !== '').length
  const [expanded, setExpanded] = useState(activeSelectCount > 0)

  // Reflect external q changes (e.g. reset button) into the local input.
  useEffect(() => {
    if ((filters.q ?? '') !== localQ && (filters.q ?? '') === '') {
      setLocalQ('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.q])

  const commitQ = () => {
    const trimmed = localQ.trim()
    if (trimmed === (filters.q ?? '')) return
    setFilter({ q: trimmed || undefined })
  }

  return (
    <section
      aria-label="Filter extensions"
      className={cn(
        'rounded-2xl border border-border/70 bg-card/70 p-3 shadow-sm backdrop-blur-sm xs:p-4 sm:p-5',
        className,
      )}
    >
      {/* Search + (mobile) filter disclosure */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative min-w-0 flex-1 basis-full xs:basis-0">
          <label htmlFor="explore-search" className="sr-only">
            Search extensions
          </label>
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            id="explore-search"
            type="search"
            value={localQ}
            placeholder="Search by name, tagline or description…"
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                commitQ()
              }
            }}
            onBlur={commitQ}
            className={cn(
              'h-11 w-full min-w-0 rounded-md border border-input bg-background pl-9 pr-10 text-sm shadow-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              'sm:h-10',
            )}
          />
          {localQ && (
            <button
              type="button"
              onClick={() => {
                setLocalQ('')
                setFilter({ q: undefined })
              }}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls="explore-filter-controls"
          className={cn(
            buttonStyles('outline', 'sm', 'justify-center'),
            'basis-full xs:w-auto xs:basis-auto sm:hidden',
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeSelectCount > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
              {activeSelectCount}
            </span>
          )}
        </button>
      </div>

      {/* Hidden behind the disclosure on phones, always rendered from `sm` up. */}
      <div className={cn(expanded ? 'block' : 'hidden', 'sm:block')}>
        <div
          id="explore-filter-controls"
          className="mt-3 grid grid-cols-1 gap-3 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:mt-4"
        >
          {/* Category */}
          <Field label="Category">
            <select
              aria-label="Filter by category"
              value={filters.category ?? ''}
              disabled={lockedCategory}
              onChange={(e) => setFilter({ category: e.target.value || undefined })}
              className={selectClass}
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Browser */}
          <Field label="Browser">
            <select
              aria-label="Filter by browser"
              value={filters.browser ?? ''}
              onChange={(e) => setFilter({ browser: e.target.value || undefined })}
              className={selectClass}
            >
              <option value="">Any browser</option>
              {browsers.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Pricing */}
          <Field label="Pricing">
            <select
              aria-label="Filter by pricing"
              value={filters.pricing ?? ''}
              onChange={(e) =>
                setFilter({ pricing: (e.target.value as Pricing) || undefined })
              }
              className={selectClass}
            >
              <option value="">Any price</option>
              {pricingOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {/* Sort */}
          <Field label="Sort by">
            <select
              aria-label="Sort extensions"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={selectClass}
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </Field>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={reset}
              className="min-h-[44px] justify-center xs:col-span-2 xs:w-auto sm:h-10 md:col-span-3 lg:col-span-4 lg:justify-self-end"
            >
              <X className="mr-1 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="relative">
        {children}
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
      </div>
    </div>
  )
}
