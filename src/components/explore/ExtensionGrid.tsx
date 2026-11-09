import { motion } from 'framer-motion'
import { ExtensionCard } from '@/components/extension/ExtensionCard'
import { CompareToggle } from '@/components/compare/CompareToggle'
import type { Extension } from '@/types'
import { fadeInUp, staggerContainer } from '@/lib/motion'

interface ExtensionGridProps {
  items: Extension[]
}

export function ExtensionGrid({ items }: ExtensionGridProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      className="grid grid-cols-1 gap-3 xs:gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((ext) => (
        <motion.div key={ext.id} variants={fadeInUp}>
          {/* { Toggle is a sibling of the card link (never a button nested in
              the card's anchor), same pattern as the dashboard's remove
              control. } */}
          <div className="space-y-2">
            <ExtensionCard extension={ext} />
            <CompareToggle slug={ext.slug} name={ext.name} iconUrl={ext.iconUrl} />
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
