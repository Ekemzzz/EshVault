import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Container } from '@/components/ui/Container'
import { SectionHeading } from '@/components/common/SectionHeading'
import { ExtensionCard } from '@/components/extension/ExtensionCard'
import {
  getPopularExtensions,
  getRecentlyAddedExtensions,
} from '@/services/extensions.service'
import type { Extension } from '@/types'
import { staggerContainer } from '@/lib/motion'
import { cn } from '@/utils/cn'

type TabKey = 'popular' | 'recent'

const tabs: { key: TabKey; label: string; getList: () => Promise<Extension[]> }[] = [
  { key: 'popular', label: 'Most popular', getList: () => getPopularExtensions(8) },
  { key: 'recent', label: 'Recently added', getList: () => getRecentlyAddedExtensions(8) },
]

export function PopularRecentlySection() {
  const [active, setActive] = useState<TabKey>('popular')
  // Service-backed lists (Supabase or demo mock fallback) so approved
  // submissions show up in "Recently added" without a redeploy.
  const [list, setList] = useState<Extension[]>([])

  useEffect(() => {
    let alive = true
    const current = tabs.find((t) => t.key === active) ?? tabs[0]
    current
      .getList()
      .then((rows) => alive && setList(rows))
      .catch(() => alive && setList([]))
    return () => {
      alive = false
    }
  }, [active])

  return (
    <Container className="py-11 xs:py-12 sm:py-16">
      <SectionHeading
        eyebrow="Trending now"
        title="Popular & recently added"
        description="What everyone is installing, and the freshest arrivals to the directory."
      />

      {/* Tabs, scrollable on very narrow screens so labels never wrap. */}
      <div className="mb-6 overflow-x-auto">
        <div
          role="tablist"
          aria-label="Extension rankings"
          className="inline-flex min-w-full gap-1 border-b border-border"
        >
          {tabs.map((t) => {
            const selected = t.key === active
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(t.key)}
                className={cn(
                  'focus-ring relative inline-flex min-h-[44px] shrink-0 items-center rounded-t-md px-4 py-2.5 text-sm font-medium transition-colors',
                  selected ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
                {selected && (
                  <motion.span
                    layoutId="tab-underline"
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <motion.div
        key={active}
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {list.map((ext) => (
          <ExtensionCard key={ext.id} extension={ext} />
        ))}
      </motion.div>
    </Container>
  )
}
