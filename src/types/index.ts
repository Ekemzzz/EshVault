// 
//  Core domain types for the Browser Extension Directory.
//  Defined now as part of the foundation so later phases build on a shared shape.
//  

export type BrowserSupport = 'chrome' | 'firefox' | 'edge' | 'safari' | 'opera'

export type Pricing = 'free' | 'freemium' | 'paid'

export type ExtensionCategory =
  | 'productivity'
  | 'security'
  | 'design'
  | 'shopping'
  | 'social'
  | 'development'
  | 'ai'
  | 'other'

export interface ExtensionAuthor {
  id: string
  name: string
  website?: string
}

export interface ExtensionFeature {
  title: string
  description?: string
}

export interface ExtensionPermission {
  label: string
  description?: string
}

export interface InstallLink {
  browser: BrowserSupport
  url: string
}

export interface Review {
  id: string
  authorName: string
  rating: number
  title?: string
  body: string
  createdAt: string
  userId?: string
  helpfulCount?: number
  isVoted?: boolean
  isMine?: boolean
}

export interface Profile {
  id: string
  displayName: string
  avatarUrl?: string
  bio?: string
  createdAt: string
  updatedAt: string
}

export interface AppUser {
  id: string
  email?: string
  displayName: string
  isAdmin: boolean
}

export interface Extension {
  id: string
  slug: string
  name: string
  tagline: string
  description: string
  category: ExtensionCategory
  browsers: BrowserSupport[]
  iconUrl?: string
  screenshotUrls?: string[]
  author?: ExtensionAuthor
  downloadCount?: number
  pricing?: Pricing
  websiteUrl?: string
  storeUrl?: string
  isFeatured?: boolean
  features?: ExtensionFeature[]
  permissions?: ExtensionPermission[]
  installLinks?: InstallLink[]
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ApiResult<T> {
  data: T
  error?: string
}
