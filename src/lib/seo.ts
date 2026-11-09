import { useEffect } from 'react'

/**
 * Lightweight per-route document metadata for this SPA: title, description,
 * Open Graph + Twitter card tags, and a robots directive. No external
 * dependency: pages call `usePageMeta({...})` and the hook keeps
 * `document.head` in sync while the route is mounted.
 */

const APP_NAME = 'EshVault'

export interface PageMeta {
  /** Human title. Pass APP_NAME itself for the homepage. */
  title: string
  description?: string
  /** Absolute or site-relative image URL for social previews (og:image). */
  image?: string
  /** og:type, defaults to 'website'. */
  type?: 'website' | 'article'
  /** True for pages that must never appear in search results. */
  noindex?: boolean
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export function usePageMeta(meta: PageMeta): void {
  const { title, description, image, type = 'website', noindex = false } = meta

  useEffect(() => {
    const fullTitle = title === APP_NAME ? APP_NAME : `${title} · ${APP_NAME}`
    const canonical = window.location.origin + window.location.pathname
    document.title = fullTitle

    upsertCanonical(canonical)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:site_name', APP_NAME)
    upsertMeta('property', 'og:url', canonical)
    upsertMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary')
    if (description) {
      upsertMeta('name', 'description', description)
      upsertMeta('property', 'og:description', description)
      upsertMeta('name', 'twitter:description', description)
    }
    if (image) {
      const abs = image.startsWith('http') || image.startsWith('/')
        ? image
        : window.location.origin + '/' + image
      upsertMeta('property', 'og:image', abs)
      upsertMeta('name', 'twitter:image', abs)
    }
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
  }, [title, description, image, type, noindex])
}
