import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { Database } from '@/types/database'
import { unwrap } from './errors'
import { categories as mockCategories, browsers as mockBrowsers } from '@/data/extensions'

type Category = Database['public']['Tables']['categories']['Row']
type Browser = Database['public']['Tables']['browsers']['Row']
type Tag = Database['public']['Tables']['tags']['Row']
type Author = Database['public']['Tables']['authors']['Row']

//  --------------------------------------------------------------------------
//   Mock Row shapers (used when Supabase isn't configured)
//   -------------------------------------------------------------------------- 

function mockCategoryRows(): Category[] {
  return mockCategories.map((c, i) => ({
    id: `c-mock-${c.slug}`,
    slug: c.slug,
    label: c.label,
    blurb: c.blurb,
    accent: c.accent,
    sort_order: i + 1,
    created_at: '2026-01-01T00:00:00.000Z',
    updated_at: '2026-01-01T00:00:00.000Z',
  }))
}

function mockBrowserRows(): Browser[] {
  // Order matches the seed so slugs are stable.
  const order = ['chrome', 'firefox', 'edge', 'safari', 'opera']
  return order.map((slug) => {
    const meta = mockBrowsers.find((b) => b.slug === slug)!
    return {
      id: `b-mock-${slug}`,
      slug: meta.slug,
      label: meta.label,
      dot: meta.dot,
      created_at: '2026-01-01T00:00:00.000Z',
    }
  })
}

//  --------------------------------------------------------------------------
//  Public reads
//  -------------------------------------------------------------------------- 

export async function listCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategoryRows()
  return unwrap(
    await supabase.from('categories').select('*').order('sort_order').order('label'),
  ) as Category[]
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured) {
    return mockCategoryRows().find((c) => c.slug === slug) ?? null
  }
  return unwrap(
    await supabase.from('categories').select('*').eq('slug', slug).maybeSingle(),
  ) as Category | null
}

export async function listBrowsers(): Promise<Browser[]> {
  if (!isSupabaseConfigured) return mockBrowserRows()
  return unwrap(await supabase.from('browsers').select('*').order('label')) as Browser[]
}

export async function listTags(): Promise<Tag[]> {
  if (!isSupabaseConfigured) return [] as Tag[]
  return unwrap(await supabase.from('tags').select('*').order('label')) as Tag[]
}

export async function getAuthor(id: string): Promise<Author | null> {
  if (!isSupabaseConfigured) return null
  return unwrap(
    await supabase.from('authors').select('*').eq('id', id).maybeSingle(),
  ) as Author | null
}
