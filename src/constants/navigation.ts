import type { LucideIcon } from 'lucide-react'
import { Compass, LayoutGrid, PlusCircle, Info, Home } from 'lucide-react'

export interface NavItem {
  label: string
  to: string
  icon: LucideIcon
}

// 
//   Single source of truth for the app's primary navigation.
//   The header, mobile menu and footer all derive their links from here.
//   "Submit" is deliberately NOT in this list: it is a call to action, so the
//   desktop bar renders it once as the primary button to the right of these
//   links (and the mobile drawer appends `submitNavItem` below them). Listing it
//   here as well produced two "Submit" entries side by side in the header.
//  
export const mainNavigation: NavItem[] = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'About', to: '/about', icon: Info },
  { label: 'Browse', to: '/browse', icon: LayoutGrid },
  { label: 'Categories', to: '/categories', icon: Compass },
]


export const submitNavItem: NavItem = { label: 'Submit', to: '/submit', icon: PlusCircle }


export const headerNavigation = mainNavigation


export const footerNavigation = mainNavigation
