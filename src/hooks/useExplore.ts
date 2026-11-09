import { useCallback, useEffect, useState } from 'react'
import { useExtensionQuery, type UseExtensionQueryResult } from './useExtensionQuery'
import { taxonomyService } from '@/services'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']
type Browser = Database['public']['Tables']['browsers']['Row']

export interface UseExploreResult extends UseExtensionQueryResult {
  categories: Category[]
  browsers: Browser[]
}

// Loads taxonomy once and composes it with the URL-driven query hook.
export function useExplore(
  options?: Parameters<typeof useExtensionQuery>[0],
): UseExploreResult {
  const query = useExtensionQuery(options)
  const [categories, setCategories] = useState<Category[]>([])
  const [browsers, setBrowsers] = useState<Browser[]>([])

  const load = useCallback(async () => {
    try {
      const [cats, brs] = await Promise.all([
        taxonomyService.listCategories(),
        taxonomyService.listBrowsers(),
      ])
      setCategories(cats)
      setBrowsers(brs)
    } catch {
      // Taxonomy is non-critical for the listing; leave selectors empty.
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return { ...query, categories, browsers }
}
