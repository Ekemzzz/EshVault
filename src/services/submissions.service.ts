//
//  Submissions service.
// 
//  A submission IS an `extensions` row forced to status='pending', the same
//  single-table model the schema was designed around (migration 0003 insert
//   policy, tightened in 0008 to bind `submitted_by` to the caller). The public
//  site reads `published_extensions`, so pending/rejected rows are invisiblethere until an admin flips the status.
//  
//  

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database, ExtensionStatus } from '@/types/database'
import type { BrowserSupport, Pricing } from '@/types'
import { getSessionUser, AuthError, AuthUnavailableError } from './auth.service'
import { unwrap, DatabaseError } from './errors'
import { uploadSubmissionIcon, uploadSubmissionScreenshot } from './storage.service'
import { getBrowserRows } from './extensions.service'

type ExtensionInsert = Database['public']['Tables']['extensions']['Insert']

export interface SubmissionInput {
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
  iconFile?: File | null
  screenshotFiles: File[]
}

export interface SubmissionSummary {
  id: string
  slug: string
  name: string
  status: ExtensionStatus
  createdAt: string
  rejectionReason: string | null
  reviewedAt: string | null
  categoryLabel: string | null
}

interface SubmissionRow {
  id: string
  slug: string
  name: string
  status: ExtensionStatus
  created_at: string
  rejection_reason: string | null
  reviewed_at: string | null
  categories: { label: string } | null
}

function mapSubmission(r: SubmissionRow): SubmissionSummary {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    status: r.status,
    createdAt: r.created_at,
    rejectionReason: r.rejection_reason,
    reviewedAt: r.reviewed_at,
    categoryLabel: r.categories?.label ?? null,
  }
}

async function requireUser() {
  if (!isSupabaseConfigured) throw new AuthUnavailableError()
  const user = await getSessionUser()
  if (!user) throw new AuthError('You must be signed in to submit an extension.')
  return user
}

/**
 * Create a pending submission: uploads assets into the submitter's own
 * storage folder, inserts the extension row, then its browser relations and
 * screenshot rows. RLS rejects anything not owned by / forced for the caller.
 */
export async function submitExtension(input: SubmissionInput): Promise<SubmissionSummary> {
  const user = await requireUser()

  const iconPath = input.iconFile ? await uploadSubmissionIcon(input.iconFile, user.id) : null

  const values: ExtensionInsert = {
    slug: input.slug,
    name: input.name,
    tagline: input.tagline || null,
    description: input.description,
    category_id: input.categoryId,
    icon_path: iconPath,
    website_url: input.websiteUrl || null,
    store_url: input.storeUrl,
    pricing: input.pricing,
    status: 'pending',
    is_featured: false,
    submitted_by: user.id,
    features: input.features.map((title) => ({ title })),
  }
  const row = unwrap(
    await supabase.from('extensions').insert(values).select('*').single(),
  ) as Database['public']['Tables']['extensions']['Row']

  await writeSubmissionRelations(row.id, user.id, input)

  const created = unwrap(
    await supabase
      .from('extensions')
      .select('id, slug, name, status, created_at, rejection_reason, reviewed_at, categories(label)')
      .eq('id', row.id)
      .single(),
  ) as SubmissionRow
  return mapSubmission(created)
}

// Browsers + screenshots for the pending row (owner policies, migration 0008).
async function writeSubmissionRelations(
  extensionId: string,
  uid: string,
  input: SubmissionInput,
): Promise<void> {
  if (input.browserSlugs.length > 0) {
    const browserRows = await getBrowserRows()
    const bySlug = new Map(browserRows.map((b) => [b.slug, b.id]))
    const links = input.browserSlugs
      .map((slug) => bySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((browser_id) => ({ extension_id: extensionId, browser_id }))
    if (links.length > 0) unwrap(await supabase.from('extension_browsers').insert(links))
  }

  if (input.screenshotFiles.length > 0) {
    const shots = []
    for (let i = 0; i < input.screenshotFiles.length; i++) {
      const file = input.screenshotFiles[i]
      const path = await uploadSubmissionScreenshot(file, uid, i)
      shots.push({ extension_id: extensionId, storage_path: path, position: i, alt_text: null })
    }
    unwrap(await supabase.from('screenshots').insert(shots))
  }
}

export async function getMySubmissions(): Promise<SubmissionSummary[]> {
  const user = await requireUser()
  const rows = unwrap(
    await supabase
      .from('extensions')
      .select('id, slug, name, status, created_at, rejection_reason, reviewed_at, categories(label)')
      .eq('submitted_by', user.id)
      .order('created_at', { ascending: false }),
  ) as SubmissionRow[]
  return rows.map(mapSubmission)
}

// Withdraw an as-yet-unreviewed submission (RLS: owner + pending only).
export async function withdrawSubmission(id: string): Promise<void> {
  await requireUser()
  unwrap(await supabase.from('extensions').delete().eq('id', id).eq('status', 'pending'))
}

export async function checkSlugAvailable(slug: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true
  const { count, error } = await supabase
    .from('extensions')
    .select('id', { count: 'exact', head: true })
    .eq('slug', slug)
  if (error) throw new DatabaseError(error.message, { code: error.code })
  return (count ?? 0) === 0
}

// Slugify helper shared by the form + tests (matches extensions_slug_format).
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/
