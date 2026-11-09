/**
 * Store links are only trustworthy when they carry the identifier the store
 * uses to address a listing: Chrome Web Store and Edge Add-ons use a 32
 * character id, Safari extensions use a numeric App Store id, while Mozilla
 * Add-ons and Opera address extensions by slug.
 *
 * A seeded or hand-typed URL such as `chromewebstore.google.com/detail/<slug>`
 * is missing that identifier and always lands on a 404, so the UI drops it
 * instead of showing a button that leads nowhere.
 */

const EXTENSION_ID = /^[a-p]{32}$/
const APPLE_ID = /^id\d{6,}$/

/** Hosts reserved for documentation or local use, never a real product site. */
const RESERVED_HOST = /(^|\.)(example\.(com|net|org)|localhost)$/i

function parse(url: string): URL | null {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:' ? parsed : null
  } catch {
    return null
  }
}

function segments(url: URL): string[] {
  return url.pathname.split('/').filter(Boolean)
}

/** True when the URL is a complete, addressable listing on a known store. */
export function isStoreListing(url: string): boolean {
  const parsed = parse(url)
  if (!parsed) return false

  const host = parsed.hostname.replace(/^www\./, '')
  const parts = segments(parsed)

  switch (host) {
    case 'chromewebstore.google.com':
    case 'chrome.google.com':
      return parts.includes('detail') && parts.some((part) => EXTENSION_ID.test(part))
    case 'microsoftedge.microsoft.com':
      return parts.includes('detail') && parts.some((part) => EXTENSION_ID.test(part))
    case 'apps.apple.com':
      return parts.some((part) => APPLE_ID.test(part))
    case 'addons.mozilla.org': {
      const at = parts.indexOf('addon')
      return at !== -1 && Boolean(parts[at + 1])
    }
    case 'addons.opera.com': {
      const at = parts.indexOf('details')
      return at !== -1 && Boolean(parts[at + 1])
    }
    default:
      return false
  }
}

/** True when the URL is a plain http(s) address we can safely link to. */
export function isRealSiteUrl(url: string): boolean {
  const parsed = parse(url)
  return parsed !== null && !RESERVED_HOST.test(parsed.hostname)
}
