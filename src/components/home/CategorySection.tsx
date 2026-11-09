import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/common/SectionHeading'
import { categories } from '@/data/extensions'
import { getExtensionCounts } from '@/services/extensions.service'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/utils/cn'

export function CategorySection() {
  // Live per-category counts so tiles never advertise more than /browse shows.
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

  // Categories with no published extensions are hidden until they have content.
  const visible = counts ? categories.filter((c) => (counts[c.slug] ?? 0) > 0) : categories

  return (
    <Container className="py-11 xs:py-12 sm:py-16">
      <SectionHeading
        eyebrow="Browse by topic"
        title="Categories"
        description="Find extensions grouped around what you actually want to get done."
        action={{ label: 'All categories', to: '/categories' }}
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {visible.map((c) => {
          const count = counts?.[c.slug]
          return (
            <motion.div key={c.slug} variants={fadeInUp}>
              <Link
                to={`/categories/${c.slug}`}
                className={cn(
                  'focus-ring group flex h-full items-center gap-3 xs:gap-4 rounded-xl border border-border bg-card p-4',
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
                  <h3 className="truncate font-semibold group-hover:text-primary">{c.label}</h3>
                  <p className="truncate text-sm text-muted-foreground">
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
