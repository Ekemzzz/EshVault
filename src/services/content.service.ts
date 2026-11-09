import { supabase } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { unwrap } from './errors'

type ExtensionInsert = Database['public']['Tables']['extensions']['Insert']
type ExtensionUpdate = Database['public']['Tables']['extensions']['Update']
type ExtensionRow = Database['public']['Tables']['extensions']['Row']

const EXTENSION_COLUMNS =
  'id, slug, name, tagline, description, category_id, author_id, icon_url, icon_path, website_url, store_url, download_count, is_featured, status, created_at, updated_at'

//  -------------------------------------------------------------------------- 
//   Submission (authenticated users), forced to the moderation queue.
//   RLS restricts non-admins to INSERT with status='pending'.
//   -------------------------------------------------------------------------- 
export async function submitExtension(
  input: Omit<ExtensionInsert, 'status' | 'is_featured'>,
): Promise<ExtensionRow> {
  return unwrap(
    await supabase
      .from('extensions')
      .insert({ ...input, status: 'pending', is_featured: false })
      .select(EXTENSION_COLUMNS)
      .single(),
  ) as ExtensionRow
}

//  -------------------------------------------------------------------------- 
//   Admin CRUD (requires admin JWT)
//   -------------------------------------------------------------------------- 
export async function createExtension(input: ExtensionInsert): Promise<ExtensionRow> {
  return unwrap(
    await supabase.from('extensions').insert(input).select(EXTENSION_COLUMNS).single(),
  ) as ExtensionRow
}

export async function updateExtension(id: string, patch: ExtensionUpdate): Promise<ExtensionRow> {
  return unwrap(
    await supabase.from('extensions').update(patch).eq('id', id).select(EXTENSION_COLUMNS).single(),
  ) as ExtensionRow
}

export async function publishExtension(id: string): Promise<ExtensionRow> {
  return updateExtension(id, { status: 'published' })
}

export async function deleteExtension(id: string): Promise<void> {
  unwrap(await supabase.from('extensions').delete().eq('id', id))
}

//  -------------------------------------------------------------------------- 
//   Relation management (admin). Replaces the full mapping atomically-enough.
//   -------------------------------------------------------------------------- 
async function resolveIds(table: 'browsers' | 'tags', slugs: string[]): Promise<string[]> {
  if (slugs.length === 0) return []
  const rows = unwrap(await supabase.from(table).select('id').in('slug', slugs)) as { id: string }[]
  return rows.map((r) => r.id)
}

export async function setExtensionBrowsers(extensionId: string, slugs: string[]): Promise<void> {
  unwrap(await supabase.from('extension_browsers').delete().eq('extension_id', extensionId))
  const ids = await resolveIds('browsers', slugs)
  if (ids.length > 0) {
    unwrap(
      await supabase
        .from('extension_browsers')
        .insert(ids.map((browser_id) => ({ extension_id: extensionId, browser_id }))),
    )
  }
}

export async function setExtensionTags(extensionId: string, slugs: string[]): Promise<void> {
  unwrap(await supabase.from('extension_tags').delete().eq('extension_id', extensionId))
  const ids = await resolveIds('tags', slugs)
  if (ids.length > 0) {
    unwrap(
      await supabase
        .from('extension_tags')
        .insert(ids.map((tag_id) => ({ extension_id: extensionId, tag_id }))),
    )
  }
}

//  Add a screenshot reference (the file must already be uploaded to storage).
export async function addScreenshot(
  extensionId: string,
  storagePath: string,
  options: { altText?: string; position?: number } = {},
): Promise<void> {
  unwrap(
    await supabase.from('screenshots').insert({
      extension_id: extensionId,
      storage_path: storagePath,
      alt_text: options.altText ?? null,
      position: options.position ?? 0,
    }),
  )
}
