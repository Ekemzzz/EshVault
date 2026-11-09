import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { queryExtensions } from '@/services/extensions.service'
import type {
  ExploreFilters,
  ExploreResult,
  SortKey,
} from '@/services/extensions.service'
import type { Pricing } from '@/types'

export const DEFAULT_PAGE_SIZE = 9

const SORT_KEYS: SortKey[] = ['trending', 'popular', 'newest', 'name_asc']

/* ---------------- URL <-> filter helpers --------------------------------- */

function parseNumber(v: string | null): number | undefined {
  if (v == null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function readFiltersFromParams(params: URLSearchParams): ExploreFilters {
  const pricingRaw = params.get('pricing')
  const f: ExploreFilters = {}
  const q = params.get('q')
  if (q) f.q = q
  const cat = params.get('category')
  if (cat) f.category = cat
  const br = params.get('browser')
  if (br) f.browser = br
  if (pricingRaw === 'free' || pricingRaw === 'freemium' || pricingRaw === 'paid') {
    f.pricing = pricingRaw as Pricing
  }
  return f
}

function readSortFromParams(params: URLSearchParams): SortKey {
  const v = params.get('sort') as SortKey | null
  return v && SORT_KEYS.includes(v) ? v : 'trending'
}

function readPageFromParams(params: URLSearchParams): number {
  const n = parseNumber(params.get('page')) ?? 1
  return Math.max(1, Math.floor(n))
}

function writeParams(input: {
  filters: ExploreFilters
  sort: SortKey
  page: number
}): URLSearchParams {
  const p = new URLSearchParams()
  const { filters, sort, page } = input
  if (filters.q) p.set('q', filters.q)
  if (filters.category) p.set('category', filters.category)
  if (filters.browser) p.set('browser', filters.browser)
  if (filters.pricing) p.set('pricing', filters.pricing)
  if (sort && sort !== 'trending') p.set('sort', sort)
  if (page > 1) p.set('page', String(page))
  return p
}

/* ---------------- Hook ---------------------------------------------------- */

export interface ExploreState extends ExploreResult {
  loading: boolean
  error?: string
}

export interface UseExtensionQueryOptions {
  pageSize?: number
  /** Category locked to the current context (e.g. /categories/:slug). */
  lockedCategory?: string
}

export interface UseExtensionQueryResult {
  filters: ExploreFilters
  sort: SortKey
  page: number
  pageSize: number
  state: ExploreState
  setFilter: (patch: Partial<ExploreFilters>) => void
  setSort: (sort: SortKey) => void
  setPage: (n: number) => void
  reset: () => void
  hasActiveFilters: boolean
}

export function useExtensionQuery(
  options: UseExtensionQueryOptions = {},
): UseExtensionQueryResult {
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const lockedCategory = options.lockedCategory
  const [params, setParams] = useSearchParams()

  const filters = useMemo(() => {
    const f = readFiltersFromParams(params)
    if (lockedCategory) f.category = lockedCategory
    return f
  }, [params, lockedCategory])

  const sort = readSortFromParams(params)
  const page = readPageFromParams(params)

  const [state, setState] = useState<ExploreState>({
    items: [],
    total: 0,
    page,
    pageSize,
    totalPages: 1,
    loading: true,
  })

  const filtersKey = JSON.stringify(filters)
  const requestToken = useRef(0)

  useEffect(() => {
    const token = ++requestToken.current
    setState((s) => ({ ...s, loading: true }))
    const delay = filters.q && filters.q.trim().length > 0 ? 220 : 0
    const id = window.setTimeout(() => {
      queryExtensions({ filters, sort, page, pageSize })
        .then((res) => {
          if (token !== requestToken.current) return
          setState({ ...res, loading: false })
        })
        .catch((err: unknown) => {
          if (token !== requestToken.current) return
          const msg = err instanceof Error ? err.message : String(err)
          setState((s) => ({ ...s, loading: false, error: msg }))
        })
    }, delay)
    return () => window.clearTimeout(id)
    // filtersKey captures content changes; sort/page/pageSize are primitives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey, sort, page, pageSize])

  const updateParams = useCallback(
    (next: {
      filters?: ExploreFilters
      sort?: SortKey
      page?: number
      // Preserve current page explicitly (default: reset to 1 on any change).
      preservePage?: boolean
    }) => {
      const mergedFilters = next.filters ?? filters
      const mergedSort = next.sort ?? sort
      let mergedPage = page
      if (next.page != null) mergedPage = next.page
      else if (!next.preservePage) mergedPage = 1
      const url = writeParams({ filters: mergedFilters, sort: mergedSort, page: mergedPage })
      setParams(url, { replace: false })
    },
    [filters, sort, page, setParams],
  )

  const setFilter = useCallback(
    (patch: Partial<ExploreFilters>) => {
      const next: ExploreFilters = { ...filters }
      ;(Object.keys(patch) as (keyof ExploreFilters)[]).forEach((k) => {
        const v = patch[k]
        if (v === undefined || v === null || v === '') {
          delete next[k]
        } else {
          // @ts-expect-error: union assignment; shape is guarded by callers.
          next[k] = v
        }
      })
      if (lockedCategory) next.category = lockedCategory
      updateParams({ filters: next })
    },
    [filters, updateParams, lockedCategory],
  )

  const setSort = useCallback(
    (s: SortKey) => updateParams({ sort: s }),
    [updateParams],
  )

  const setPage = useCallback(
    (n: number) => updateParams({ page: Math.max(1, Math.floor(n)), preservePage: true }),
    [updateParams],
  )

  const reset = useCallback(() => {
    const only: ExploreFilters = {}
    if (lockedCategory) only.category = lockedCategory
    updateParams({ filters: only, sort: 'trending', page: 1 })
  }, [updateParams, lockedCategory])

  const hasActiveFilters = useMemo(() => {
    const keys: (keyof ExploreFilters)[] = ['q', 'category', 'browser', 'pricing']
    return keys.some((k) => filters[k] !== undefined && filters[k] !== '')
  }, [filters])

  return {
    filters,
    sort,
    page,
    pageSize,
    state,
    setFilter,
    setSort,
    setPage,
    reset,
    hasActiveFilters,
  }
}
