import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { BrowserLogo } from '@/components/common/BrowserLogo'
import { SectionHeading } from '@/components/common/SectionHeading'
import { browsers } from '@/data/extensions'
import { getExtensionCounts } from '@/services/extensions.service'
import { fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/utils/cn'

export function BrowserDiscoverySection() {
  // Live per-browser counts from the published catalog.
  const [counts, setCounts] = useState<Record<string, number> | null>(null)

  useEffect(() => {
    let alive = true
    getExtensionCounts()
      .then((c) => alive && setCounts(c.byBrowser))
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <Container className="py-11 xs:py-12 sm:py-16">
      <SectionHeading
        eyebrow="Works with your browser"
        title="Discover by browser"
        description="Pick your browser and see the extensions that run on it."
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="grid grid-cols-2 gap-3 xs:gap-4 md:grid-cols-3 lg:grid-cols-5"
      >
        {browsers.map((b) => {
          const count = counts?.[b.slug]
          return (
            <motion.div key={b.slug} variants={fadeInUp}>
              <Link
                to={`/browse?browser=${b.slug}`}
                className={cn(
                  'focus-ring group flex h-full flex-col justify-between gap-4 xs:gap-6 rounded-xl border border-border bg-card p-3.5 xs:p-5',
                  'transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md',
                )}
              >
                <div className="flex min-w-0 items-center justify-between gap-1">
                  <span className="flex min-w-0 items-center gap-1.5 text-sm font-semibold xs:gap-2 xs:text-base">
                    <BrowserLogo browser={b.slug} className="h-5 w-5 shrink-0" />
                    <span className="truncate">{b.label}</span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                </div>
                <div>
                  <p className="text-xl font-bold xs:text-2xl">{count ?? '\u2014'}</p>
                  <p className="text-xs text-muted-foreground">
                    {count == null || count === 1 ? 'extension' : 'extensions'}
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
