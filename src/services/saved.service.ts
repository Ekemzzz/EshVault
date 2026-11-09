//
//  Saved extensions (bookmarks).
// 

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Extension } from '@/types'
import type { PublishedExtension } from '@/types/database'
import { mapPublishedExtension } from './mappers'
import { unwrap, DatabaseError } from './errors'
import { getSessionUser } from './auth.service'

// Ids of the signed-in user's saved extensions (empty when signed out).
export async function getSavedIds(): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set()
  const me = await getSessionUser()
  if (!me) return new Set()
  const rows = unwrap(
    await supabase.from('saved_extensions').select('extension_id').eq('user_id', me.id),
  ) as { extension_id: string }[]
  return new Set(rows.map((r) => r.extension_id))
}

// Full extension records for everything the user has saved, newest first.
export async function listSaved(): Promise<Extension[]> {
  if (!isSupabaseConfigured) return []
  const me = await getSessionUser()
  if (!me) return []
  const links = unwrap(
    await supabase
      .from('saved_extensions')
      .select('extension_id, created_at')
      .eq('user_id', me.id)
      .order('created_at', { ascending: false }),
  ) as { extension_id: string }[]
  if (links.length === 0) return []

  // Second query on the public view keeps the mapping identical to the
  // listing pages and respects published-only RLS.
  const rows = unwrap(
    await supabase
      .from('published_extensions')
      .select('*')
      .in('id', links.map((l) => l.extension_id)),
  ) as PublishedExtension[]
  const byId = new Map(rows.map((r) => [r.id, mapPublishedExtension(r)]))
  // Preserve saved order; skip rows no longer published.
  return links.map((l) => byId.get(l.extension_id)).filter((e): e is Extension => !!e)
}

export async function toggleSaved(extensionId: string): Promise<boolean> {
  const me = await getSessionUser()
  if (!me) throw new DatabaseError('You must be signed in to save extensions.')
  const existing = unwrap(
    await supabase
      .from('saved_extensions')
      .select('extension_id')
      .eq('user_id', me.id)
      .eq('extension_id', extensionId)
      .maybeSingle(),
  ) as { extension_id: string } | null

  if (existing) {
    unwrap(
      await supabase
        .from('saved_extensions')
        .delete()
        .eq('user_id', me.id)
        .eq('extension_id', extensionId)
        .select('extension_id'),
    )
    return false
  }
  unwrap(
    await supabase.from('saved_extensions').insert({ user_id: me.id, extension_id: extensionId }).select('extension_id'),
  )
  return true
}
