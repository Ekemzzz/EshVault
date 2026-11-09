import { ExploreView } from '@/components/explore/ExploreView'
import { useExplore } from '@/hooks/useExplore'
import { usePageMeta } from '@/lib/seo'

export function Browse() {
  usePageMeta({
    title: 'Browse extensions',
    description:
      'Search and filter the full directory of curated browser extensions by category, browser and pricing.',
  })
  const explore = useExplore()
  return (
    <ExploreView
      eyebrow="Catalog"
      title="Browse extensions"
      description="Search, filter and sort the full directory. Combine filters to narrow in on exactly what you need."
      explore={explore}
    />
  )
}
