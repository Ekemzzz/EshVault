import type { LucideIcon } from 'lucide-react'
import {
  Zap,
  ShieldCheck,
  Palette,
  Code2,
  Bot,
  ShoppingCart,
  Share2,
  Puzzle,
} from 'lucide-react'
import type { BrowserSupport, Extension, ExtensionCategory } from '@/types'

/* -------------------------------------------------------------------------- *
 * Category metadata
 * -------------------------------------------------------------------------- */
export interface CategoryMeta {
  slug: ExtensionCategory
  label: string
  blurb: string
  icon: LucideIcon
  accent: string // tailwind gradient classes for the icon tile
}

export const categories: CategoryMeta[] = [
  {
    slug: 'productivity',
    label: 'Productivity',
    blurb: 'Tab managers, notes and automation',
    icon: Zap,
    accent: 'from-amber-400 to-orange-500',
  },
  {
    slug: 'security',
    label: 'Security & Privacy',
    blurb: 'Blockers, vaults and protection',
    icon: ShieldCheck,
    accent: 'from-emerald-400 to-teal-500',
  },
  {
    slug: 'design',
    label: 'Design & Creativity',
    blurb: 'Colour, font and layout tools',
    icon: Palette,
    accent: 'from-pink-400 to-rose-500',
  },
  {
    slug: 'development',
    label: 'Developer Tools',
    blurb: 'Inspectors and API helpers',
    icon: Code2,
    accent: 'from-sky-400 to-indigo-500',
  },
  {
    slug: 'ai',
    label: 'AI & Automation',
    blurb: 'Writing, search copilots',
    icon: Bot,
    accent: 'from-violet-400 to-purple-500',
  },
  {
    slug: 'shopping',
    label: 'Shopping & Deals',
    blurb: 'Coupons and price tracking',
    icon: ShoppingCart,
    accent: 'from-lime-400 to-green-500',
  },
  {
    slug: 'social',
    label: 'Social Media & Marketing',
    blurb: 'Feeds, messaging and focus',
    icon: Share2,
    accent: 'from-cyan-400 to-blue-500',
  },
  {
    slug: 'other',
    label: 'More',
    blurb: 'Everything else worth a look',
    icon: Puzzle,
    accent: 'from-slate-400 to-gray-500',
  },
]

export const categoryBySlug = (slug: ExtensionCategory): CategoryMeta =>
  categories.find((c) => c.slug === slug) ?? categories[categories.length - 1]

/* -------------------------------------------------------------------------- *
 * Browser metadata
 * -------------------------------------------------------------------------- */
export interface BrowserMeta {
  slug: BrowserSupport
  label: string
  dot: string // tailwind bg color for the status dot
}

export const browsers: BrowserMeta[] = [
  { slug: 'chrome', label: 'Chrome', dot: 'bg-red-500' },
  { slug: 'firefox', label: 'Firefox', dot: 'bg-orange-500' },
  { slug: 'edge', label: 'Edge', dot: 'bg-sky-500' },
  { slug: 'safari', label: 'Safari', dot: 'bg-blue-400' },
  { slug: 'opera', label: 'Opera', dot: 'bg-rose-500' },
]

/* -------------------------------------------------------------------------- *
 * Sample extensions (mock data until Supabase is wired up in a later phase)
 * -------------------------------------------------------------------------- */
const now = '2026-01-01T00:00:00.000Z'

export const extensions: Extension[] = [
  {
    id: '1',
    slug: 'velocity-tabs',
    name: 'Velocity Tabs',
    iconUrl: '/extension-logos/velocity-tabs.png',
    tagline: 'Supercharge your tab workflow',
    description:
      'Group, suspend and search thousands of tabs instantly. Save sessions and restore them with a keystroke.',
    category: 'productivity',
    browsers: ['chrome', 'edge', 'opera'],
    downloadCount: 1200000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://example.com/velocity-tabs',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '4',
    slug: 'devscope',
    name: 'DevScope',
    iconUrl: '/extension-logos/devscope.png',
    tagline: 'A debugger that lives in your toolbar',
    description:
      'Inspect network calls, edit localStorage and preview APIs without leaving the page you are on.',
    category: 'development',
    browsers: ['chrome', 'edge', 'firefox'],
    downloadCount: 540000,
    pricing: 'freemium',
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '11',
    slug: 'react-developer-tools',
    name: 'React Developer Tools',
    iconUrl: '/extension-logos/react-developer-tools.png',
    tagline: 'Inspect React components and their props',
    description:
      'Adds a React panel to the browser dev tools for inspecting component trees, editing props and state live, and profiling re-renders.',
    category: 'development',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 4000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://react.dev/learn/react-developer-tools',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '12',
    slug: 'requestly',
    name: 'Requestly',
    iconUrl: '/extension-logos/requestly.png',
    tagline: 'Modify HTTP requests and responses',
    description:
      'Redirect URLs, override headers and mock API responses without a proxy, so edge cases can be tested on the real site.',
    category: 'development',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 350000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://requestly.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '13',
    slug: 'axe-devtools',
    name: 'axe DevTools',
    iconUrl: '/extension-logos/axe-devtools.png',
    tagline: 'Accessibility issues, caught early',
    description:
      'Scans any page for WCAG accessibility issues and suggests fixes, straight from a panel in your developer tools.',
    category: 'development',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 750000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://www.deque.com/axe/devtools/',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '14',
    slug: 'cookie-editor',
    name: 'Cookie-Editor',
    iconUrl: '/extension-logos/cookie-editor.png',
    tagline: 'View, edit and manage browser cookies',
    description:
      'Lists every cookie set for the current site and lets you add, edit, delete, import or export them in one click.',
    category: 'development',
    browsers: ['chrome', 'firefox', 'edge', 'opera'],
    downloadCount: 1900000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://cookie-editor.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '15',
    slug: 'google-keep',
    name: 'Google Keep',
    iconUrl: '/extension-logos/google-keep.png',
    tagline: 'Save quick notes, ideas and reminders',
    description:
      'Clips the page you are on into a Keep note, then keeps notes, lists and reminders in sync across your devices.',
    category: 'productivity',
    browsers: ['chrome', 'edge'],
    downloadCount: 3000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://keep.google.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '16',
    slug: 'onetab',
    name: 'OneTab',
    iconUrl: '/extension-logos/onetab.png',
    tagline: 'Turn open tabs into a manageable list',
    description:
      'Collapses every open tab into one restorable list, freeing memory and keeping sessions tidy.',
    category: 'productivity',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 2000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://www.one-tab.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '17',
    slug: 'todoist',
    name: 'Todoist',
    iconUrl: '/extension-logos/todoist.png',
    tagline: 'Capture tasks and manage to-do lists',
    description:
      'Adds the current page as a task, plans your day and syncs projects across every device.',
    category: 'productivity',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 1100000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://todoist.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '18',
    slug: 'notion-web-clipper',
    name: 'Notion Web Clipper',
    iconUrl: '/extension-logos/notion-web-clipper.png',
    tagline: 'Save web pages directly to Notion',
    description:
      'Sends the page you are reading to any Notion database or page, keeping the title, URL and highlights.',
    category: 'productivity',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 1400000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://www.notion.com/web-clipper',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '19',
    slug: 'bitwarden',
    name: 'Bitwarden',
    iconUrl: '/extension-logos/bitwarden.png',
    tagline: 'Stores and manages passwords securely',
    description:
      'Keeps logins in an end-to-end encrypted vault, generates strong passwords and autofills them with passkeys.',
    category: 'security',
    browsers: ['chrome', 'firefox', 'edge', 'safari'],
    downloadCount: 1500000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://bitwarden.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '20',
    slug: 'ublock-origin-lite',
    name: 'uBlock Origin Lite',
    iconUrl: '/extension-logos/ublock-origin-lite.png',
    tagline: 'Blocks advertisements and unwanted content',
    description:
      'Filters ads, pop-ups and tracking elements with declarative rule lists that need no broad page access.',
    category: 'security',
    browsers: ['chrome', 'edge'],
    downloadCount: 2600000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://github.com/uBlockOrigin/uBOL-home',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '21',
    slug: 'adguard',
    name: 'AdGuard',
    iconUrl: '/extension-logos/adguard.png',
    tagline: 'Blocks ads, pop-ups and tracking elements',
    description:
      'Filters ads, pop-ups and trackers, cleans up leftover page elements and adds optional parental control.',
    category: 'security',
    browsers: ['chrome', 'firefox', 'edge', 'safari'],
    downloadCount: 1200000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://adguard.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '22',
    slug: 'monica',
    name: 'Monica',
    iconUrl: '/extension-logos/monica.png',
    tagline: 'AI assistant for writing, research and summarisation',
    description:
      'Chats about the page you are on, drafts and summarises text and answers research questions from a side panel.',
    category: 'ai',
    browsers: ['chrome', 'edge'],
    downloadCount: 900000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://monica.im',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '23',
    slug: 'sider',
    name: 'Sider',
    iconUrl: '/extension-logos/sider.jpg',
    tagline: 'Provides AI assistance while browsing websites',
    description:
      'Sidebar assistant that explains pages, translates selections and answers questions about what you are reading.',
    category: 'ai',
    browsers: ['chrome', 'edge'],
    downloadCount: 1200000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://sider.ai',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '24',
    slug: 'merlin',
    name: 'Merlin',
    iconUrl: '/extension-logos/merlin.png',
    tagline: 'Helps with AI-powered writing and summarisation',
    description:
      'Summarises long pages, drafts replies and answers prompts with your preferred model from any site.',
    category: 'ai',
    browsers: ['chrome', 'edge'],
    downloadCount: 700000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://www.getmerlin.in',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '25',
    slug: 'harpa-ai',
    name: 'HARPA AI',
    iconUrl: '/extension-logos/harpa-ai.png',
    tagline: 'Combines AI assistance with browser automation',
    description:
      'Runs AI commands, monitors pages and automates repetitive browsing tasks with saved workflows.',
    category: 'ai',
    browsers: ['chrome', 'edge', 'firefox'],
    downloadCount: 800000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://harpa.ai',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '26',
    slug: 'perfectpixel',
    name: 'PerfectPixel',
    iconUrl: '/extension-logos/perfectpixel.png',
    tagline: 'Compares website layouts against design mockups',
    description:
      'Overlays a design mockup on the live page with transparency control so pixels can be compared directly.',
    category: 'design',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 600000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://www.welldonecode.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '27',
    slug: 'muzli',
    name: 'Muzli',
    iconUrl: '/extension-logos/muzli.png',
    tagline: 'Provides design inspiration and creative resources',
    description:
      'Replaces the new tab with a curated feed of design inspiration, UI patterns and creative finds.',
    category: 'design',
    browsers: ['chrome', 'edge'],
    downloadCount: 300000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://muz.li',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '28',
    slug: 'colorzilla',
    name: 'ColorZilla',
    iconUrl: '/extension-logos/colorzilla.png',
    tagline: 'Picks colours from websites and identifies colour codes',
    description:
      'Eyedrops any pixel on the page and copies the value as HEX, RGB or HSL, with a built-in palette history.',
    category: 'design',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 3000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://www.colorzilla.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '29',
    slug: 'capital-one-shopping',
    name: 'Capital One Shopping',
    iconUrl: '/extension-logos/capital-one-shopping.png',
    tagline: 'Compares prices and searches for better deals',
    description:
      'Checks other retailers for the same item and applies available coupon codes at checkout.',
    category: 'shopping',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 5000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://capitaloneshopping.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '30',
    slug: 'keepa',
    name: 'Keepa',
    iconUrl: '/extension-logos/keepa.png',
    tagline: 'Tracks Amazon product prices over time',
    description:
      'Adds price history charts and price-drop alerts directly to Amazon product pages.',
    category: 'shopping',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 1500000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://keepa.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '31',
    slug: 'coupert',
    name: 'Coupert',
    iconUrl: '/extension-logos/coupert.png',
    tagline: 'Finds coupon codes and cashback offers',
    description:
      'Tests coupon codes at checkout automatically and stacks cashback offers from partner stores.',
    category: 'shopping',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 2000000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://www.coupert.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '32',
    slug: 'buffer',
    name: 'Buffer',
    iconUrl: '/extension-logos/buffer.png',
    tagline: 'Helps schedule and manage social media posts',
    description:
      'Queues posts from any page, schedules them across connected channels and tracks what performs best.',
    category: 'social',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 300000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://buffer.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '33',
    slug: 'hunter',
    name: 'Hunter',
    iconUrl: '/extension-logos/hunter.png',
    tagline: 'Finds professional email addresses associated with websites',
    description:
      'Shows the public email addresses and contacts linked to the site you are visiting.',
    category: 'social',
    browsers: ['chrome', 'edge'],
    downloadCount: 700000,
    pricing: 'freemium',
    isFeatured: false,
    websiteUrl: 'https://hunter.io',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '34',
    slug: 'seoquake',
    name: 'SEOquake',
    iconUrl: '/extension-logos/seoquake.png',
    tagline: 'Provides SEO metrics and website analysis',
    description:
      'Adds on-page SEO audits, keyword density and authority metrics to any search result or site.',
    category: 'social',
    browsers: ['chrome', 'firefox', 'edge'],
    downloadCount: 900000,
    pricing: 'free',
    isFeatured: false,
    websiteUrl: 'https://www.semrush.com',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '5',
    slug: 'copilot-canvas',
    name: 'Copilot Canvas',
    iconUrl: '/extension-logos/copilot-canvas.png',
    tagline: 'Your AI writing sidekick',
    description:
      'Rewrite, summarise and translate any text box on the web with a single click. Bring your own model.',
    category: 'ai',
    browsers: ['chrome', 'edge'],
    downloadCount: 890000,
    pricing: 'free',
    isFeatured: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '6',
    slug: 'cartwatch',
    name: 'CartWatch',
    iconUrl: '/extension-logos/cartwatch.webp',
    tagline: 'Never overpay again',
    description:
      'Automatic coupon hunting plus price-drop alerts across hundreds of stores.',
    category: 'shopping',
    browsers: ['chrome', 'firefox', 'edge', 'opera'],
    downloadCount: 1600000,
    pricing: 'free',
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '7',
    slug: 'focus-flow',
    name: 'Focus Flow',
    iconUrl: '/extension-logos/focus-flow.png',
    tagline: 'Reclaim your attention',
    description:
      'Time-box distracting sites, silence notifications and enter deep-work mode on schedule.',
    category: 'social',
    browsers: ['chrome', 'firefox', 'safari'],
    downloadCount: 320000,
    pricing: 'freemium',
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '9',
    slug: 'color-pickr',
    name: 'Color Picker',
    iconUrl: '/extension-logos/color-picker.png',
    tagline: 'Grab colours from any pixel',
    description:
      'Eyedrop colours from images, videos and the page, then export palettes in one click.',
    category: 'design',
    browsers: ['chrome', 'edge'],
    downloadCount: 98000,
    pricing: 'free',
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: '10',
    slug: 'vaultpass',
    name: 'VaultPass',
    iconUrl: '/extension-logos/vaultpass.png',
    tagline: 'Zero-knowledge password autofill',
    description:
      'Generate, store and autofill strong passkeys with end-to-end encryption.',
    category: 'security',
    browsers: ['chrome', 'firefox', 'edge', 'safari', 'opera'],
    downloadCount: 2100000,
    pricing: 'paid',
    isFeatured: false,
    createdAt: now,
    updatedAt: now,
  },
]

/* -------------------------------------------------------------------------- *
 * Selectors for the homepage sections
 * -------------------------------------------------------------------------- */
export const getExtensions = (): Extension[] => extensions

export const getFeaturedExtensions = (): Extension[] =>
  extensions.filter((e) => e.isFeatured)

export const getPopularExtensions = (limit = 4): Extension[] =>
  [...extensions]
    .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
    .slice(0, limit)

export const getRecentlyAddedExtensions = (limit = 4): Extension[] =>
  [...extensions]
    .sort((a, b) => Number(b.id) - Number(a.id))
    .slice(0, limit)

export const getExtensionCountByCategory = (slug: ExtensionCategory): number =>
  extensions.filter((e) => e.category === slug).length

export const getExtensionCountByBrowser = (slug: BrowserSupport): number =>
  extensions.filter((e) => e.browsers.includes(slug)).length

/** Lightweight deterministic palette so cards get a stable accent. */
export function gradientForSlug(slug: string): string {
  const pool = categories.map((c) => c.accent)
  let hash = 0
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0
  return pool[hash % pool.length]
}

/** First-letter-based short initials for an extension name. */
export function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/** Format large install counts (1.2M, 340K). Unknown values render as an em dash. */
export function formatCount(value?: number | null): string {
  if (value == null) return '\u2014'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return String(value)
}
