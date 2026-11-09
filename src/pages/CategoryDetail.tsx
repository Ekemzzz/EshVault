import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/Button'
import { ExploreView } from '@/components/explore/ExploreView'
import { useExplore } from '@/hooks/useExplore'
import { taxonomyService } from '@/services'
import { usePageMeta } from '@/lib/seo'
import type { Database } from '@/types/database'

type Category = Database['public']['Tables']['categories']['Row']

export function CategoryDetail() {
  const { slug = '' } = useParams<{ slug: string }>()
  const [category, setCategory] = useState<Category | null | undefined>(undefined)
  const explore = useExplore({ lockedCategory: slug })

  usePageMeta({
    title: category ? `${category.label} extensions` : 'Category',
    description:
      category?.blurb ?? 'Browse browser extensions in this category.',
    noindex: category === null,
  })

  useEffect(() => {
    let cancelled = false
    setCategory(undefined)
    taxonomyService
      .getCategoryBySlug(slug)
      .then((row) => {
        if (!cancelled) setCategory(row)
      })
      .catch(() => {
        if (!cancelled) setCategory(null)
      })
    return () => {
      cancelled = true
    }
  }, [slug])

  if (category === undefined) {
    return (
      <Container className="py-12 xs:py-16 text-center text-muted-foreground">
        Loading category…
      </Container>
    )
  }

  if (category === null) {
    return (
      <Container className="py-12 xs:py-16 text-center">
        <Badge variant="outline">404</Badge>
        <h1 className="mt-4 text-2xl font-bold xs:text-3xl">Category not found</h1>
        <p className="mt-2 break-words text-muted-foreground">
          We could not find a category for “{slug}”.
        </p>
        <div className="mt-6 flex w-full flex-col items-stretch justify-center gap-2 xs:w-auto xs:flex-row xs:items-center xs:gap-2">
          <Link to="/categories" className={buttonStyles('primary', 'md', 'w-full xs:w-auto')}>
            Back to all categories
          </Link>
          <Link to="/browse" className={buttonStyles('outline', 'md', 'w-full xs:w-auto')}>
            Browse everything
          </Link>
        </div>
      </Container>
    )
  }

  return (
    <ExploreView
      eyebrow={category.label}
      title={`${category.label} extensions`}
      description={category.blurb ?? `Every ${category.label.toLowerCase()} extension in the directory.`}
      explore={explore}
      lockedCategory={slug}
    />
  )
}
