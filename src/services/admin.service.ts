// 
//  Admin service.
//  
//   Server-side truth is RLS: every query here rides the `admin manages`
//   policies from migrations 0003/0006 (is_admin() on the JWT), so a
//   non-admin calling these functions simply gets zero rows / permission
//   errors even if the client-side AdminRoute guard were bypassed.
//  

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database, ExtensionStatus } from '@/types/database'
import type { BrowserSupport, Pricing } from '@/types'
import { unwrap, DatabaseError } from './errors'
import { getBrowserRows } from './extensions.service'
import { uploadIcon, uploadScreenshot } from './storage.service'
import { AuthUnavailableError } from './auth.service'

type ExtensionRow = Database['public']['Tables']['extensions']['Row']
type ExtensionUpdate = Database['public']['Tables']['extensions']['Update']

/* ------------------------------ extensions -------------------------------- */

export interface AdminExtensionRow {
  id: string
  slug: string
  name: string
  status: ExtensionStatus
  isFeatured: boolean
  downloadCount: number
  pricing: Pricing
  categoryLabel: string | null
  submittedBy: string | null
  rejectionReason: string | null
  updatedAt: string
}

interface AdminExtensionDbRow extends ExtensionRow {
  categories: { label: string } | null
}

function mapAdminRow(r: AdminExtensionDbRow): AdminExtensionRow {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    status: r.status,
    isFeatured: r.is_featured,
    downloadCount: Number(r.download_count),
    pricing: r.pricing,
    categoryLabel: r.categories?.label ?? null,
    submittedBy: r.submitted_by,
    rejectionReason: r.rejection_reason,
    updatedAt: r.updated_at,
  }
}

const ADMIN_COLUMNS =
  'id, slug, name, status, is_featured, download_count, pricing, submitted_by, rejection_reason, updated_at, categories(label)'

/** All rows (any status), newest change first; optional status + name filter. */
export async function listAllExtensions(
  filter: { status?: ExtensionStatus | 'all'; query?: string } = {},
): Promise<AdminExtensionRow[]> {
  requireConfigured()
  let builder = supabase
    .from('extensions')
    .select(ADMIN_COLUMNS)
    .order('updated_at', { ascending: false })
    .limit(200)
  if (filter.status && filter.status !== 'all') builder = builder.eq('status', filter.status)
  if (filter.query?.trim()) builder = builder.ilike('name', `%${filter.query.trim()}%`)
  const rows = unwrap(await builder) as AdminExtensionDbRow[]
  return rows.map(mapAdminRow)
}

/** Full detail for the admin editor: base row + relation slugs/paths. */
export interface AdminExtensionDetail {
  row: ExtensionRow
  browserSlugs: BrowserSupport[]
  screenshotPaths: string[]
  featureLabels: string[]
}

export async function getAdminExtensionDetail(id: string): Promise<AdminExtensionDetail | null> {
  requireConfigured()
  const { data, error } = await supabase.from('extensions').select('*').eq('id', id).maybeSingle()
  if (error) throw new DatabaseError(error.message, { code: error.code })
  if (!data) return null
  const row = data as ExtensionRow

  const [eb, shots] = await Promise.all([
    supabase.from('extension_browsers').select('browsers(slug)').eq('extension_id', id),
    supabase.from('screenshots').select('storage_path').eq('extension_id', id).order('position'),
  ])
  unwrap(eb)
  unwrap(shots)

  const browserSlugs = ((eb.data ?? []) as Array<{ browsers: { slug: string } | null }>)
    .map((r) => r.browsers?.slug)
    .filter((s): s is string => Boolean(s)) as BrowserSupport[]
  const featureLabels = Array.isArray(row.features)
    ? (row.features as Array<{ title?: unknown; label?: unknown }>)
        .map((f) =>
          typeof f?.title === 'string' && f.title
            ? f.title
            : typeof f?.label === 'string'
              ? f.label
              : '',
        )
        .filter(Boolean)
    : []

  return {
    row,
    browserSlugs,
    screenshotPaths: ((shots.data ?? []) as Array<{ storage_path: string }>).map(
      (s) => s.storage_path,
    ),
    featureLabels,
  }
}

export interface AdminExtensionInput {
  name: string
  slug: string
  tagline: string
  description: string
  categoryId: string
  browserSlugs: BrowserSupport[]
  pricing: Pricing
  storeUrl: string
  websiteUrl?: string
  features: string[]
  status: ExtensionStatus
  downloadCount?: number
  iconFile?: File | null
  /** Existing stored icon path to keep when no new file was picked. */
  iconPath?: string | null
  screenshotFiles: File[]
  /** Existing screenshot storage paths to keep. */
  screenshotPaths: string[]
}

/**
 * Create (id = null) or update an extension with its relations, admin-style.
 * New files upload to the curated icons//screenshots/ paths; relation rows
 * are replaced wholesale so the editor state is the source of truth.
 */
export async function saveExtension(
  input: AdminExtensionInput,
  id?: string,
): Promise<{ id: string }> {
  requireConfigured()

  let iconPath = input.iconPath ?? null
  if (input.iconFile) {
    iconPath = await uploadIcon(input.iconFile, input.slug)
  }

  const values: ExtensionUpdate = {
    name: input.name,
    slug: input.slug,
    tagline: input.tagline || null,
    description: input.description || null,
    category_id: input.categoryId,
    store_url: input.storeUrl || null,
    website_url: input.websiteUrl || null,
    pricing: input.pricing,
    status: input.status,
    icon_path: iconPath,
    features: input.features.map((title) => ({ title })),
    ...(input.downloadCount !== undefined ? { download_count: input.downloadCount } : {}),
  }

  let extensionId: string
  if (id) {
    unwrap(await supabase.from('extensions').update(values).eq('id', id).select('id').single())
    extensionId = id
  } else {
    const created = unwrap(
      await supabase
        .from('extensions')
        .insert({ ...values, slug: input.slug } as Database['public']['Tables']['extensions']['Insert'])
        .select('id')
        .single(),
    ) as { id: string }
    extensionId = created.id
  }

  await replaceRelations(extensionId, input)
  return { id: extensionId }
}

async function replaceRelations(extensionId: string, input: AdminExtensionInput): Promise<void> {
  // Browsers: delete + reinsert from the editor's selection.
  unwrap(await supabase.from('extension_browsers').delete().eq('extension_id', extensionId))
  if (input.browserSlugs.length > 0) {
    const browserRows = await getBrowserRows()
    const bySlug = new Map(browserRows.map((b) => [b.slug, b.id]))
    const links = input.browserSlugs
      .map((slug) => bySlug.get(slug))
      .filter((v): v is string => Boolean(v))
      .map((browser_id) => ({ extension_id: extensionId, browser_id }))
    if (links.length > 0) unwrap(await supabase.from('extension_browsers').insert(links))
  }

  // Screenshots: keep listed paths, upload new files, drop the rest.
  const paths: string[] = [...input.screenshotPaths]
  for (let i = 0; i < input.screenshotFiles.length; i++) {
    paths.push(await uploadScreenshot(input.screenshotFiles[i], input.slug, paths.length + i))
  }
  unwrap(await supabase.from('screenshots').delete().eq('extension_id', extensionId))
  if (paths.length > 0) {
    unwrap(
      await supabase.from('screenshots').insert(
        paths.map((storage_path, position) => ({
          extension_id: extensionId,
          storage_path,
          position,
        })),
      ),
    )
  }
}

export async function deleteExtension(id: string): Promise<void> {
  requireConfigured()
  unwrap(await supabase.from('extensions').delete().eq('id', id))
}

export async function toggleFeatured(id: string, value: boolean): Promise<void> {
  requireConfigured()
  unwrap(await supabase.from('extensions').update({ is_featured: value }).eq('id', id))
}

/* ------------------------------ submissions -------------------------------- */

export interface PendingSubmission {
  id: string
  slug: string
  name: string
  tagline: string | null
  description: string | null
  storeUrl: string | null
  websiteUrl: string | null
  pricing: Pricing
  status: ExtensionStatus
  categoryLabel: string | null
  iconPath: string | null
  browserSlugs: BrowserSupport[]
  screenshotPaths: string[]
  submittedBy: string | null
  createdAt: string
  rejectionReason: string | null
}

export async function listSubmissions(
  status: 'pending' | 'rejected' = 'pending',
): Promise<PendingSubmission[]> {
  requireConfigured()
  const rows = unwrap(
    await supabase
      .from('extensions')
      .select('*, categories(label)')
      .eq('status', status)
      .order('created_at', { ascending: false })
      .limit(100),
  ) as AdminExtensionDbRow[]

  const details = await Promise.all(
    rows.map(async (row) => {
      const [eb, shots] = await Promise.all([
        supabase.from('extension_browsers').select('browsers(slug)').eq('extension_id', row.id),
        supabase.from('screenshots').select('storage_path').eq('extension_id', row.id).order('position'),
      ])
      const browserSlugs = ((eb.data ?? []) as Array<{ browsers: { slug: string } | null }>)
        .map((r) => r.browsers?.slug)
        .filter((s): s is string => Boolean(s)) as BrowserSupport[]
      const screenshotPaths = ((shots.data ?? []) as Array<{ storage_path: string }>).map(
        (s) => s.storage_path,
      )
      const submission: PendingSubmission = {
        id: row.id,
        slug: row.slug,
        name: row.name,
        tagline: row.tagline,
        description: row.description,
        storeUrl: row.store_url,
        websiteUrl: row.website_url,
        pricing: row.pricing,
        status: row.status,
        categoryLabel: row.categories?.label ?? null,
        iconPath: row.icon_path,
        browserSlugs,
        screenshotPaths,
        submittedBy: row.submitted_by,
        createdAt: row.created_at,
        rejectionReason: row.rejection_reason,
      }
      return submission
    }),
  )
  return details
}

export async function approveSubmission(id: string): Promise<void> {
  requireConfigured()
  unwrap(
    await supabase
      .from('extensions')
      .update({ status: 'published', reviewed_at: new Date().toISOString(), rejection_reason: null })
      .eq('id', id),
  )
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  requireConfigured()
  unwrap(
    await supabase
      .from('extensions')
      .update({ status: 'rejected', rejection_reason: reason, reviewed_at: new Date().toISOString() })
      .eq('id', id),
  )
}

export async function countPendingSubmissions(): Promise<number> {
  requireConfigured()
  const { count } = await supabase
    .from('extensions')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'pending')
  return count ?? 0
}

/* ------------------------------- categories -------------------------------- */

export interface CategoryAdminRow {
  id: string
  slug: string
  label: string
  blurb: string | null
  sortOrder: number
}

export async function getCategoryRows(): Promise<CategoryAdminRow[]> {
  requireConfigured()
  const rows = unwrap(
    await supabase.from('categories').select('*').order('sort_order', { ascending: true }),
  ) as Database['public']['Tables']['categories']['Row'][]
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    label: r.label,
    blurb: r.blurb ?? null,
    sortOrder: r.sort_order,
  }))
}

export interface CategoryInput {
  slug: string
  label: string
  blurb?: string | null
  sortOrder: number
}

export async function insertCategory(input: CategoryInput): Promise<void> {
  requireConfigured()
  unwrap(
    await supabase.from('categories').insert({
      slug: input.slug,
      label: input.label,
      blurb: input.blurb ?? null,
      sort_order: input.sortOrder,
    }),
  )
}

export async function updateCategory(id: string, input: CategoryInput): Promise<void> {
  requireConfigured()
  unwrap(
    await supabase
      .from('categories')
      .update({
        slug: input.slug,
        label: input.label,
        blurb: input.blurb ?? null,
        sort_order: input.sortOrder,
      })
      .eq('id', id),
  )
}

export async function deleteCategory(id: string): Promise<void> {
  requireConfigured()
  unwrap(await supabase.from('categories').delete().eq('id', id))
}

/* ----------------------------- review moderation --------------------------- */

export interface AdminReviewRow {
  id: string
  rating: number
  title: string | null
  body: string
  createdAt: string
  authorName: string
  extensionName: string | null
  extensionSlug: string | null
}

export async function listAllReviews(limit = 200): Promise<AdminReviewRow[]> {
  requireConfigured()
  const rows = unwrap(
    await supabase
      .from('reviews')
      .select('id, rating, title, body, created_at, author_name, extensions(name, slug)')
      .order('created_at', { ascending: false })
      .limit(limit),
  ) as Array<
    Database['public']['Tables']['reviews']['Row'] & {
      extensions: { name: string; slug: string } | null
    }
  >
  return rows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    body: r.body,
    createdAt: r.created_at,
    authorName: r.author_name,
    extensionName: r.extensions?.name ?? null,
    extensionSlug: r.extensions?.slug ?? null,
  }))
}

export async function adminDeleteReview(id: string): Promise<void> {
  requireConfigured()
  unwrap(await supabase.from('reviews').delete().eq('id', id))
}

/* --------------------------------- helpers --------------------------------- */

function requireConfigured() {
  if (!isSupabaseConfigured) throw new AuthUnavailableError()
}
