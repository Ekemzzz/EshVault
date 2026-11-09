import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutGrid, PlusCircle } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonStyles } from '@/components/ui/Button'
import { SearchBar } from '@/components/search/SearchBar'
import { easeOutQuint } from '@/lib/motion'
import { getExtensionCounts, type ExtensionCounts } from '@/services/extensions.service'

export function Hero() {
  // Live catalog stats, the static seed is not shown to keep the hero
  // numbers honest with what /browse actually returns.
  const [counts, setCounts] = useState<ExtensionCounts | null>(null)

  useEffect(() => {
    let alive = true
    getExtensionCounts()
      .then((c) => alive && setCounts(c))
      .catch(() => alive && setCounts(null))
    return () => {
      alive = false
    }
  }, [])

  const stats = [
    { label: 'Extensions', value: counts ? String(counts.total) : '\u2014' },
    {
      label: 'Browsers',
      value: counts ? String(Object.values(counts.byBrowser).filter((n) => n > 0).length) : '\u2014',
    },
    {
      label: 'Categories',
      value: counts ? String(Object.values(counts.byCategory).filter((n) => n > 0).length) : '\u2014',
    },
  ]

  return (
    <section className="relative overflow-hidden">
      {/* warm radial glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,hsl(var(--primary)/0.14),transparent_100%)]"
      />
      <Container className="flex flex-col items-center py-12 text-center xs:py-16 sm:py-20 lg:py-24">
        <motion.h1
          initial={{ y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.05 }}
          className="mt-5 max-w-3xl text-[1.75rem] leading-[1.15] font-extrabold tracking-tight xs:text-4xl sm:text-5xl lg:text-6xl"
        >
          Find the best <span className="text-primary">browser extensions</span> in one place
        </motion.h1>

        <motion.p
          initial={{ y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.12 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground xs:text-lg"
        >
          Discover, compare and submit extensions that make your browser faster, safer and more
          delightful.
        </motion.p>

        <motion.div
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.2 }}
          className="mt-8 w-full max-w-xl"
        >
          <SearchBar
            size="lg"
            suggestions={[
              { label: 'Tab manager' },
              { label: 'Password manager' },
              { label: 'Privacy' },
              { label: 'AI' },
              { label: 'Dev tools', to: '/browse?category=development' },
            ]}
          />
        </motion.div>

        <motion.div
          initial={{ y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOutQuint, delay: 0.28 }}
          className="mt-6 flex w-full flex-col items-stretch justify-center gap-3 xs:w-auto xs:flex-row xs:items-center"
        >
          <Link to="/browse" className={buttonStyles('primary', 'lg')}>
            <LayoutGrid className="h-5 w-5" />
            Browse all
          </Link>
          <Link to="/submit" className={buttonStyles('outline', 'lg')}>
            <PlusCircle className="h-5 w-5" />
            Submit an extension
          </Link>
        </motion.div>

        <motion.dl
          initial={{ y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.36 }}
          className="mt-10 flex w-full items-start justify-center gap-4 xs:gap-8 sm:gap-12"
        >
          {stats.map((s) => (
            <div key={s.label} className="min-w-0 flex-1 text-center">
              <dt className="sr-only">{s.label}</dt>
              <dd className="text-xl font-bold xs:text-2xl sm:text-3xl">{s.value}</dd>
              <dd className="text-[11px] text-muted-foreground xs:text-xs sm:text-sm">{s.label}</dd>
            </div>
          ))}
        </motion.dl>
      </Container>
    </section>
  )
}
