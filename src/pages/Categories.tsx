import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/common/PageHeader'
import { Container } from '@/components/ui/Container'
import { categories } from '@/data/extensions'
import { getExtensionCounts } from '@/services/extensions.service'
import { usePageMeta } from '@/lib/seo'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/utils/cn'

export function Categories() {
  usePageMeta({
    title: 'Explore by category',
    description: 'Browser extensions grouped by what they help you do.',
  })
  // Live per-category counts (mirrors the homepage tiles).
  const [counts, setCounts] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    let alive = true
    getExtensionCounts()
      .then((c) => alive && setCounts(c.byCategory))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  const visible = counts ? categories.filter((c) => (counts[c.slug] ?? 0) > 0) : categories

  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader
        eyebrow="Categories"
        title="Explore by category"
        description="Extensions grouped by what they help you do."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {visible.map((c) => {
          const count = counts?.[c.slug]
          return (
            <motion.div key={c.slug} variants={fadeInUp}>
              <Link
                to={`/categories/${c.slug}`}
                className={cn(
                  'group flex h-full items-start gap-3 xs:gap-4 rounded-xl border border-border bg-card p-4 xs:p-5',
                  'transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md',
                )}
              >
                <span
                  className={cn(
                    'grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white shadow-sm xs:h-11 xs:w-11',
                    c.accent,
                  )}
                >
                  <c.icon className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-semibold group-hover:text-primary">
                    {c.label}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{c.blurb}</p>
                  <p className="mt-3 text-xs uppercase tracking-wider text-muted-foreground">
                    {count == null
                      ? '\u2014'
                      : `${count} ${count === 1 ? 'extension' : 'extensions'}`}
                  </p>
                </div>
              </Link>
            </motion.div>
          )
        })}
      </motion.div>
    </Container>
  )
}
