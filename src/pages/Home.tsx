import { Hero } from '@/components/home/Hero'
import { CategorySection } from '@/components/home/CategorySection'
import { PopularRecentlySection } from '@/components/home/PopularRecentlySection'
import { BrowserDiscoverySection } from '@/components/home/BrowserDiscoverySection'
import { CTASection } from '@/components/home/CTASection'

import { usePageMeta } from '@/lib/seo'

//
//   Homepage: composed from independent, animated section components.
//   Each section fetches live catalog data from the services layer (which
//   falls back to the local seed only when Supabase isn't configured).
//  
export function Home() {
  usePageMeta({
    title: 'EshVault',
    description:
      'Discover, compare and submit browser extensions that make your browser faster, safer and more delightful.',
  })
  return (
    <div>
      <Hero />
      <CategorySection />
      <PopularRecentlySection />
      <BrowserDiscoverySection />
      <CTASection />
    </div>
  )
}
