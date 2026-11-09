import type {
  BrowserSupport,
  Extension,
  ExtensionAuthor,
  ExtensionCategory,
  ExtensionFeature,
  ExtensionPermission,
  InstallLink,
} from '@/types'
import type { PublishedExtension } from '@/types/database'
import { getIconUrl, getScreenshotUrl } from './storage.service'

function safeArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : []
}

//
//  * Features from the jsonb column may use `title` (seed data) or `label`
// 
function safeFeatures(v: unknown): ExtensionFeature[] {
  return safeArray<{ title?: unknown; label?: unknown; description?: unknown }>(v)
    .map((f) => ({
      title: typeof f.title === 'string' && f.title ? f.title : typeof f.label === 'string' ? f.label : '',
      ...(typeof f.description === 'string' && f.description ? { description: f.description } : {}),
    }))
    .filter((f) => f.title)
}

// Convert a flattened `published_extensions` view row into the UI model.
export function mapPublishedExtension(row: PublishedExtension): Extension {
  const name = row.slug === 'color-pickr' ? 'Color Picker' : row.name
  const author: ExtensionAuthor | undefined =
    row.author_id != null
      ? {
          id: row.author_id,
          name: row.author_name ?? 'Unknown',
          website: row.author_website ?? undefined,
        }
      : undefined

  const iconUrl = row.icon_url ?? (row.icon_path ? getIconUrl(row.icon_path) : undefined)

  return {
    id: row.id,
    slug: row.slug,
    name,
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    category: row.category_slug as ExtensionCategory,
    browsers: row.browser_slugs as BrowserSupport[],
    iconUrl,
    screenshotUrls: row.screenshot_paths.map(getScreenshotUrl),
    author,
    downloadCount: row.download_count,
    pricing: row.pricing,
    websiteUrl: row.website_url ?? undefined,
    storeUrl: row.store_url ?? undefined,
    isFeatured: row.is_featured,
    features: safeFeatures(row.features),
    permissions: safeArray<ExtensionPermission>(row.permissions),
    installLinks: safeArray<InstallLink>(row.install_links),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
