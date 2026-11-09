import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database, PublishedExtension } from '@/types/database'
import type { Extension, Pricing, Review } from '@/types'
import { mapPublishedExtension } from './mappers'
import { unwrap, DatabaseError } from './errors'
import { getExtensions, categories as categoryMeta } from '@/data/extensions'
import { getSessionUser, getMyProfile } from './auth.service'

/** Simple filter set for public listing (kept for backwards compatibility). */
export interface ExtensionQuery {
  category?: string
  browser?: string
  featuredOnly?: boolean
  limit?: number
  offset?: number
}

/** Sort keys exposed on the Explore page. */
export type SortKey = 'trending' | 'popular' | 'newest' | 'name_asc'

/** Combined filter set for the Explore page. */
export interface ExploreFilters {
  q?: string
  category?: string
  browser?: string
  pricing?: Pricing
}

export interface ExploreOptions {
  filters?: ExploreFilters
  sort?: SortKey
  page?: number
  pageSize?: number
}

export interface ExploreResult {
  items: Extension[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/* -------------------------------------------------------------------------- *
 * Internal helpers
 * -------------------------------------------------------------------------- */

function applySimpleQuery(builder: any, q: ExtensionQuery) {
  if (q.category) builder = builder.eq('category_slug', q.category)
  if (q.browser) builder = builder.contains('browser_slugs', [q.browser])
  if (q.featuredOnly) builder = builder.eq('is_featured', true)
  if (q.limit != null) builder = builder.limit(q.limit)
  if (q.offset != null) builder = builder.range(q.offset, q.offset + (q.limit ?? 20) - 1)
  return builder
}

function escapeLike(value: string): string {
  // Supabase's PostgREST `ilike` uses standard SQL LIKE wildcards; escape
  // anything that could break out of the value into filter syntax.
  return value.replace(/[,%()]/g, '').trim()
}

function applyExploreFilters(builder: any, f: ExploreFilters) {
  if (f.category) builder = builder.eq('category_slug', f.category)
  if (f.browser) builder = builder.contains('browser_slugs', [f.browser])
  if (f.pricing) builder = builder.eq('pricing', f.pricing)
  if (f.q && f.q.trim().length > 0) {
    const like = `%${escapeLike(f.q)}%`
    builder = builder.or(
      `name.ilike.${like},tagline.ilike.${like},description.ilike.${like}`,
    )
  }
  return builder
}

const SORT_ORDERS: Record<SortKey, { column: string; asc: boolean }[]> = {
  trending: [{ column: 'download_count', asc: false }],
  popular: [{ column: 'download_count', asc: false }],
  newest: [{ column: 'created_at', asc: false }],
  name_asc: [{ column: 'name', asc: true }],
}

/**
 * Non-empty word list for the lenient search fallback. Words shorter than
 * three characters ('ai', 'ad') are dropped from substring matching because
 * `%ad%` style clauses match far too much noise; they still work through the
 * ranked full-text RPC that runs first.
 */
function searchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => escapeLike(t))
    .filter((t) => t.length >= 3)
}

/** Category/browser/pricing filters applied to already-fetched view rows. */
function filterRows(rows: PublishedExtension[], f: ExploreFilters): PublishedExtension[] {
  return rows.filter((r) => {
    if (f.category && r.category_slug !== f.category) return false
    if (f.browser && !(r.browser_slugs ?? []).includes(f.browser)) return false
    if (f.pricing && (r.pricing ?? 'free') !== f.pricing) return false
    return true
  })
}

/** In-memory equivalent of SORT_ORDERS for the search path. */
function sortRows(rows: PublishedExtension[], sort: SortKey): PublishedExtension[] {
  const arr = [...rows]
  for (const s of [...SORT_ORDERS[sort]].reverse()) {
    arr.sort((a, b) => {
      const av = (a as Record<string, unknown>)[s.column]
      const bv = (b as Record<string, unknown>)[s.column]
      if (typeof av === 'string' && typeof bv === 'string') {
        return s.asc ? av.localeCompare(bv) : bv.localeCompare(av)
      }
      const an = typeof av === 'number' ? av : 0
      const bn = typeof bv === 'number' ? bv : 0
      return s.asc ? an - bn : bn - an
    })
  }
  return arr
}

/* -------------------------------------------------------------------------- *
 * Mock fallback (used when Supabase isn't configured, Phase 4 preview mode)
 * -------------------------------------------------------------------------- */

function queryMock(opts: {
  filters: ExploreFilters
  sort: SortKey
  page: number
  pageSize: number
}): ExploreResult {
  const { filters, sort, page, pageSize } = opts
  const q = filters.q?.toLowerCase().trim() ?? ''

  const matched = getExtensions().filter((e) => {
    if (filters.category && e.category !== filters.category) return false
    if (filters.browser && !e.browsers.includes(filters.browser as any)) return false
    if (filters.pricing) {
      // Treat missing pricing as 'free' (matches DB default).
      const p = e.pricing ?? 'free'
      if (p !== filters.pricing) return false
    }
    if (q) {
      const hay = `${e.name} ${e.tagline} ${e.description} ${e.category}`.toLowerCase()
      if (!hay.includes(q)) return false
    }
    return true
  })

  const sorted = sortMock(matched, sort)
  const total = sorted.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: sorted.slice(start, start + pageSize),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

function sortMock(items: Extension[], sort: SortKey): Extension[] {
  const arr = [...items]
  switch (sort) {
    case 'newest':
      arr.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      break
    case 'name_asc':
      arr.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'popular':
    case 'trending':
    default:
      arr.sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
  }
  return arr
}

/* -------------------------------------------------------------------------- *
 * Public API
 * -------------------------------------------------------------------------- */

/** Full explore query with combined filters + sorting + pagination. */
export async function queryExtensions(
  options: ExploreOptions = {},
): Promise<ExploreResult> {
  const pageSize = Math.max(1, options.pageSize ?? 12)
  const page = Math.max(1, options.page ?? 1)
  const sort: SortKey = options.sort ?? 'trending'
  const filters = options.filters ?? {}

  if (!isSupabaseConfigured) {
    return queryMock({ filters, sort, page, pageSize })
  }

  const query = filters.q?.trim() ?? ''
  if (query) {
    return queryWithSearch(query, filters, sort, page, pageSize)
  }

  const offset = (page - 1) * pageSize

  // Count query (head + exact), mirrors the filters without selecting rows.
  const countQuery = await applyExploreFilters(
    supabase.from('published_extensions').select('id', { count: 'exact', head: true }),
    filters,
  )
  const total = countQuery.count ?? 0

  // Data query, same filters + order + range.
  let dataBuilder: any = applyExploreFilters(
    supabase.from('published_extensions').select('*'),
    filters,
  )
  for (const s of SORT_ORDERS[sort]) {
    dataBuilder = dataBuilder.order(s.column, { ascending: s.asc })
  }
  dataBuilder = dataBuilder.range(offset, offset + pageSize - 1)

  const rows = unwrap(await dataBuilder) as PublishedExtension[]
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return {
    items: rows.map(mapPublishedExtension),
    total,
    page,
    pageSize,
    totalPages,
  }
}

/**
 * Search path: the ranked `search_extensions()` full-text RPC first (handles
 * phrases and multi-word queries), then the remaining filters applied in
 * memory. When the strict full-text match finds nothing, a lenient per-word
 * ilike fallback keeps common queries like "password manager" from returning
 * an empty page. Catalog is small, so in-memory pagination is fine here.
 */
async function queryWithSearch(
  query: string,
  filters: ExploreFilters,
  sort: SortKey,
  page: number,
  pageSize: number,
): Promise<ExploreResult> {
  let rows = filterRows(
    unwrap(await supabase.rpc('search_extensions', { p_query: query })) as PublishedExtension[],
    filters,
  )
  let rpcRanked = rows.length > 0

  if (!rpcRanked) {
    const tokens = searchTokens(query)
    if (tokens.length > 0) {
      const clauses = tokens.flatMap((t) => [
        `name.ilike.%${t}%`,
        `tagline.ilike.%${t}%`,
        `description.ilike.%${t}%`,
      ])
      let builder: any = supabase.from('published_extensions').select('*').or(clauses.join(','))
      if (filters.category) builder = builder.eq('category_slug', filters.category)
      if (filters.browser) builder = builder.contains('browser_slugs', [filters.browser])
      if (filters.pricing) builder = builder.eq('pricing', filters.pricing)
      rows = unwrap(await builder) as PublishedExtension[]
    }
  }

  // The RPC returns relevance-ranked rows; keep that order for the default
  // view, but re-sort when the visitor picked another order or when the
  // lenient substring fallback produced the rows.
  if (!rpcRanked || sort !== 'trending') rows = sortRows(rows, sort)

  const total = rows.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(Math.max(1, page), totalPages)
  const start = (safePage - 1) * pageSize
  return {
    items: rows.slice(start, start + pageSize).map(mapPublishedExtension),
    total,
    page: safePage,
    pageSize,
    totalPages,
  }
}

/** Public, paginated listing with optional filters. Ordered by popularity. */
export async function listExtensions(q: ExtensionQuery = {}): Promise<Extension[]> {
  if (!isSupabaseConfigured) {
    // Very light fallback: reuse queryMock but honour limit/offset.
    const page = Math.floor((q.offset ?? 0) / (q.limit ?? 20)) + 1
    const res = queryMock({
      filters: { category: q.category, browser: q.browser },
      sort: 'trending',
      page,
      pageSize: q.limit ?? 20,
    })
    return q.featuredOnly ? res.items.filter((e) => e.isFeatured) : res.items
  }
  const rows = unwrap(
    await applySimpleQuery(
      selectPublished().order('download_count', { ascending: false }),
      q,
    ),
  ) as PublishedExtension[]
  return rows.map(mapPublishedExtension)
}

/** Editor's picks. */
export async function getFeaturedExtensions(limit = 8): Promise<Extension[]> {
  return listExtensions({ featuredOnly: true, limit })
}

/** Most popular by install count. */
export async function getPopularExtensions(limit = 8): Promise<Extension[]> {
  return listExtensions({ limit })
}

/** Newest first. */
export async function getRecentlyAddedExtensions(limit = 8): Promise<Extension[]> {
  if (!isSupabaseConfigured) {
    return queryMock({ filters: {}, sort: 'newest', page: 1, pageSize: limit }).items
  }
  const rows = unwrap(
    await supabase
      .from('published_extensions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit),
  ) as PublishedExtension[]
  return rows.map(mapPublishedExtension)
}

/** Full-text search (backed by the search_extensions() SQL function). */
export async function searchExtensions(query: string): Promise<Extension[]> {
  if (!isSupabaseConfigured) {
    return queryMock({ filters: { q: query }, sort: 'trending', page: 1, pageSize: 20 }).items
  }
  const rows = unwrap(
    await supabase.rpc('search_extensions', { p_query: query }),
  ) as PublishedExtension[]
  return rows.map(mapPublishedExtension)
}

/** Single published extension by slug, or null if not found/not published. */
export async function getExtensionBySlug(slug: string): Promise<Extension | null> {
  if (!isSupabaseConfigured) {
    const base = getExtensions().find((e) => e.slug === slug)
    if (!base) return null
    return withMockDetail(base)
  }
  const row = unwrap(
    await supabase.from('published_extensions').select('*').eq('slug', slug).maybeSingle(),
  ) as PublishedExtension | null
  return row ? mapPublishedExtension(row) : null
}

type ReviewRow = Database['public']['Tables']['reviews']['Row']

/** PostgREST shape when embedding helpful_votes(count), a wrapper array. */
interface ReviewRowWithVotes extends ReviewRow {
  helpful_votes?: { count: number }[]
}

/**
 * Reviews for an extension. Returns at most `limit`, newest first.
 * When a session exists, each review also carries viewer state (helpfulCount,
 * isVoted, isMine); signed-out viewers get counts but never vote state.
 */
export async function getReviews(slug: string, limit = 20): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    const detail = extensionDetails[slug]
    return detail ? [...detail.reviews].slice(0, limit) : []
  }
  // Reviews reference extension_id, so resolve slug → id first via the view.
  const { data, error } = await supabase
    .from('published_extensions')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()
  if (error || !data) return []

  const me = await getSessionUser().catch(() => null)
  const rows = unwrap(
    await supabase
      .from('reviews')
      .select('*, helpful_votes(count)')
      .eq('extension_id', (data as { id: string }).id)
      .order('created_at', { ascending: false })
      .limit(limit),
  ) as unknown as ReviewRowWithVotes[]

  // Which of these reviews has the viewer voted on? (RLS lets us read all
  // vote rows, so filter client-side by our own user id.)
  const votedIds = new Set<string>()
  if (me && rows.length > 0) {
    const { data: votes } = await supabase
      .from('helpful_votes')
      .select('review_id')
      .eq('user_id', me.id)
      .in('review_id', rows.map((r) => r.id))
    for (const v of (votes ?? [] as { review_id: string }[])) votedIds.add(v.review_id)
  }

  return rows.map((r) => ({
    id: r.id,
    authorName: r.author_name,
    rating: r.rating,
    title: r.title ?? undefined,
    body: r.body,
    createdAt: r.created_at,
    userId: r.user_id ?? undefined,
    helpfulCount: r.helpful_votes?.[0]?.count ?? 0,
    isVoted: votedIds.has(r.id),
    isMine: !!me && r.user_id === me.id,
  }))
}

export interface NewReviewInput {
  rating: number
  title?: string
  body: string
}

/**
 * Create a review for a published extension as the signed-in user.
 * Duplicate reviews (one per user per extension) are rejected with a clear
 * message; RLS guarantees the row carries the caller's own user id.
 */
export async function createReview(slug: string, input: NewReviewInput): Promise<Review> {
  const me = await getSessionUser()
  if (!me) throw new DatabaseError('You must be signed in to write a review.')
  const profile = await getMyProfile()
  const extRow = unwrap(
    await supabase.from('published_extensions').select('id').eq('slug', slug).maybeSingle(),
  ) as { id: string } | null
  if (!extRow) throw new DatabaseError('Extension not found.')

  try {
    const row = unwrap(
      await supabase
        .from('reviews')
        .insert({
          extension_id: extRow.id,
          user_id: me.id,
          author_name: profile?.displayName ?? me.displayName,
          rating: input.rating,
          title: input.title?.trim() || null,
          body: input.body.trim(),
        })
        .select('*')
        .single(),
    ) as ReviewRow
    return {
      id: row.id,
      authorName: row.author_name,
      rating: row.rating,
      title: row.title ?? undefined,
      body: row.body,
      createdAt: row.created_at,
      userId: row.user_id ?? undefined,
      helpfulCount: 0,
      isVoted: false,
      isMine: true,
    }
  } catch (err) {
    if (err instanceof DatabaseError && err.code === '23505') {
      throw new DatabaseError('You have already reviewed this extension. Edit your existing review instead.')
    }
    throw err
  }
}

/** Update a review, RLS restricts this to the author (or an admin). */
export async function updateReview(id: string, input: NewReviewInput): Promise<void> {
  unwrap(
    await supabase
      .from('reviews')
      .update({
        rating: input.rating,
        title: input.title?.trim() || null,
        body: input.body.trim(),
      })
      .eq('id', id)
      .select('id'),
  )
}

/** Delete a review, RLS restricts this to the author (or an admin). */
export async function deleteReview(id: string): Promise<void> {
  unwrap(await supabase.from('reviews').delete().eq('id', id).select('id'))
}

/** Toggle a "was this review helpful?" vote for the signed-in user. */
export async function setHelpfulVote(reviewId: string, on: boolean): Promise<void> {
  const me = await getSessionUser()
  if (!me) throw new DatabaseError('You must be signed in to vote.')
  if (on) {
    const { error } = await supabase.from('helpful_votes').insert({ review_id: reviewId, user_id: me.id })
    // 23505 = already voted; idempotent success.
    if (error && error.code !== '23505') throw new DatabaseError(error.message, { code: error.code })
  } else {
    unwrap(
      await supabase
        .from('helpful_votes')
        .delete()
        .eq('review_id', reviewId)
        .eq('user_id', me.id)
        .select('id'),
    )
  }
}

/** All reviews written by the signed-in user, newest first (dashboard). */
export async function getMyReviews(): Promise<(Review & { extensionSlug: string; extensionName: string })[]> {
  if (!isSupabaseConfigured) return []
  const me = await getSessionUser()
  if (!me) return []
  const rows = unwrap(
    await supabase
      .from('reviews')
      .select('*, helpful_votes(count), extensions!extension_id(slug, name)')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false }),
  ) as unknown as (ReviewRowWithVotes & {
    extensions?: { slug: string; name: string } | { slug: string; name: string }[] | null
  })[]
  return rows.map((r) => {
    const ext = Array.isArray(r.extensions) ? r.extensions[0] : r.extensions
    return {
      id: r.id,
      authorName: r.author_name,
      rating: r.rating,
      title: r.title ?? undefined,
      body: r.body,
      createdAt: r.created_at,
      userId: r.user_id ?? undefined,
      helpfulCount: r.helpful_votes?.[0]?.count ?? 0,
      isVoted: false,
      isMine: true,
      extensionSlug: ext?.slug ?? '',
      extensionName: ext?.name ?? 'Unknown extension',
    }
  })
}

/** Related extensions (same category first), excluding self. */
export async function getAlternatives(
  slug: string,
  limit = 3,
): Promise<Extension[]> {
  if (!isSupabaseConfigured) {
    const all = getExtensions()
    const self = all.find((e) => e.slug === slug)
    if (!self) return []
    const sameCategory = all.filter((e) => e.slug !== slug && e.category === self.category)
    const rest = all.filter((e) => e.slug !== slug && e.category !== self.category)
    const ranked = [...sameCategory, ...rest].sort(
      (a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0),
    )
    return ranked.slice(0, limit)
  }
  const base = await getExtensionBySlug(slug)
  if (!base) return []
  const rows = unwrap(
    await supabase
      .from('published_extensions')
      .select('*')
      .eq('category_slug', base.category)
      .neq('slug', slug)
      .order('download_count', { ascending: false })
      .limit(limit),
  ) as PublishedExtension[]
  // Pad cross-category (most popular first) like the mock path does, so
  // extensions in single-item categories still surface alternatives.
  if (rows.length < limit) {
    const seen = new Set([slug, ...rows.map((r) => r.slug)])
    const extras = unwrap(
      await supabase
        .from('published_extensions')
        .select('*')
        .neq('slug', slug)
        .order('download_count', { ascending: false })
        .limit(limit * 3), // over-fetch so the dedupe can still fill the rest
    ) as PublishedExtension[]
    for (const row of extras) {
      if (rows.length >= limit) break
      if (!seen.has(row.slug)) {
        seen.add(row.slug)
        rows.push(row)
      }
    }
  }
  return rows.map(mapPublishedExtension)
}

/* -------------------------------------------------------------------------- *
 * Mock detail merger (used when Supabase isn't configured)
 * -------------------------------------------------------------------------- */

import { extensionDetails } from '@/data/extensionDetails'

function withMockDetail(base: Extension): Extension {
  const d = extensionDetails[base.slug]
  if (!d) return base
  return {
    ...base,
    features: d.features,
    permissions: d.permissions,
    installLinks: d.installLinks,
  }
}

/** Count of published extensions, optionally filtered by category or browser. */
export async function countExtensions(
  filter: { category?: string; browser?: string } = {},
): Promise<number> {
  if (!isSupabaseConfigured) {
    return getExtensions().filter((e) => {
      if (filter.category && e.category !== filter.category) return false
      if (filter.browser && !e.browsers.includes(filter.browser as any)) return false
      return true
    }).length
  }
  let builder = supabase.from('published_extensions').select('id', { count: 'exact', head: true })
  if (filter.category) builder = builder.eq('category_slug', filter.category)
  if (filter.browser) builder = builder.contains('browser_slugs', [filter.browser])
  const { count } = await builder
  return count ?? 0
}

export interface ExtensionCounts {
  total: number
  byCategory: Record<string, number>
  byBrowser: Record<string, number>
}

//
//  One lightweight query backing the homepage hero stats, category tiles and
//  browser tiles so they reflect the live catalog instead of the static seed.
// 
export async function getExtensionCounts(): Promise<ExtensionCounts> {
  if (!isSupabaseConfigured) {
    const byCategory: Record<string, number> = {}
    const byBrowser: Record<string, number> = {}
    for (const e of getExtensions()) {
      byCategory[e.category] = (byCategory[e.category] ?? 0) + 1
      for (const b of e.browsers) byBrowser[b] = (byBrowser[b] ?? 0) + 1
    }
    return { total: getExtensions().length, byCategory, byBrowser }
  }
  const rows = unwrap(
    await supabase.from('published_extensions').select('category_slug, browser_slugs'),
  ) as Pick<PublishedExtension, 'category_slug' | 'browser_slugs'>[]
  const byCategory: Record<string, number> = {}
  const byBrowser: Record<string, number> = {}
  for (const r of rows) {
    if (r.category_slug) byCategory[r.category_slug] = (byCategory[r.category_slug] ?? 0) + 1
    for (const b of r.browser_slugs ?? []) byBrowser[b] = (byBrowser[b] ?? 0) + 1
  }
  return { total: rows.length, byCategory, byBrowser }
}

function selectPublished() {
  return supabase.from('published_extensions').select('*')
}

/* --------------------------- reference data ------------------------------- */

export interface CategoryRow {
  id: string
  slug: string
  label: string
  blurb: string | null
  sortOrder: number
}

export interface BrowserRow {
  id: string
  slug: string
  label: string
}

//
//  Category rows from the `categories` table, submission/admin forms need the
//  uuid ids, whereas the public UI only works with slug metadata. In demo mode
//  deterministic id=slug rows are produced from the static metadata.
//  
export async function getCategories(): Promise<CategoryRow[]> {
  if (!isSupabaseConfigured) {
    return categoryMeta.map((c, i) => ({
      id: c.slug,
      slug: c.slug,
      label: c.label,
      blurb: c.blurb,
      sortOrder: i,
    }))
  }
  const rows = unwrap(
    await supabase
      .from('categories')
      .select('id, slug, label, blurb, sort_order')
      .order('sort_order', { ascending: true }),
  ) as Database['public']['Tables']['categories']['Row'][]
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    label: r.label,
    blurb: r.blurb ?? null,
    sortOrder: r.sort_order,
  }))
}

// Browser rows (id + slug + label) for relation writing. 
export async function getBrowserRows(): Promise<BrowserRow[]> {
  if (!isSupabaseConfigured) return [] 
  const rows = unwrap(
    await supabase.from('browsers').select('id, slug, label').order('label', { ascending: true }),
  ) as Database['public']['Tables']['browsers']['Row'][]
  return rows.map((r) => ({ id: r.id, slug: r.slug, label: r.label }))
}
