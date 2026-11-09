import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { PlusCircle, Compass } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { buttonStyles } from '@/components/ui/Button'
import { easeOutQuint } from '@/lib/motion'

export function CTASection() {
  return (
    <Container className="py-14 sm:py-16">
      <motion.div
        initial={{ y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: easeOutQuint }}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-accent/40 to-secondary px-4 py-10 text-center xs:px-6 xs:py-12 sm:px-12 sm:py-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]"
        />
        <div className="relative">
          <h2 className="text-2xl font-bold tracking-tight xs:text-3xl sm:text-4xl">
            Built something worth sharing?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground xs:text-base">
            List your extension on the directory and get in front of people actively looking for
            tools like yours. It only takes a minute.
          </p>
          <div className="mt-7 flex w-full flex-col items-stretch justify-center gap-3 xs:mt-8 xs:w-auto xs:flex-row xs:items-center">
            <Link to="/submit" className={buttonStyles('primary', 'lg')}>
              <PlusCircle className="h-5 w-5" />
              Submit your extension
            </Link>
            <Link to="/browse" className={buttonStyles('outline', 'lg')}>
              <Compass className="h-5 w-5" />
              Explore the directory
            </Link>
          </div>
        </div>
      </motion.div>
    </Container>
  )
}
