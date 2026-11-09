import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/common/PageHeader'
import { FilterBar } from './FilterBar'
import { ExtensionGrid } from './ExtensionGrid'
import { EmptyState, LoadingState } from './EmptyState'
import { Pagination } from './Pagination'
import type { UseExploreResult } from '@/hooks/useExplore'

interface ExploreViewProps {
  eyebrow: string
  title: string
  description?: string
  explore: UseExploreResult
  // When set, category filter is disabled and locked to this slug.
  lockedCategory?: string
}

export function ExploreView({
  eyebrow,
  title,
  description,
  explore,
  lockedCategory,
}: ExploreViewProps) {
  const {
    filters,
    sort,
    pageSize,
    state,
    setFilter,
    setSort,
    setPage,
    reset,
    hasActiveFilters,
    categories,
    browsers,
  } = explore

  const showGrid = !state.loading && state.items.length > 0
  const showEmpty = !state.loading && state.items.length === 0

  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <FilterBar
        className="mb-6"
        filters={filters}
        sort={sort}
        categories={categories.map((c) => ({ slug: c.slug, label: c.label }))}
        browsers={browsers.map((b) => ({ slug: b.slug, label: b.label }))}
        setFilter={setFilter}
        setSort={setSort}
        reset={reset}
        hasActiveFilters={hasActiveFilters}
        lockedCategory={!!lockedCategory}
      />

      {state.error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Something went wrong while loading extensions: {state.error}
        </div>
      )}

      {state.loading && <LoadingState />}
      {showGrid && (
        <>
          <ExtensionGrid items={state.items} />
          <div className="mt-6 xs:mt-8">
            <Pagination
              page={state.page}
              totalPages={state.totalPages}
              total={state.total}
              pageSize={pageSize}
              onChange={setPage}
            />
          </div>
        </>
      )}
      {showEmpty && (
        <EmptyState onReset={reset} hasActiveFilters={hasActiveFilters} />
      )}
    </Container>
  )
}
