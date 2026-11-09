import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: ReactNode
  children?: ReactNode
}

export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="mb-6 space-y-3 xs:mb-7 sm:mb-8">
      {eyebrow && (
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="text-sm font-semibold uppercase tracking-wide text-primary"
        >
          {eyebrow}
        </motion.p>
      )}
      <motion.h1
        variants={fadeInUp}
        initial="hidden"
        animate="show"
        className="break-words text-[1.75rem] leading-[1.15] font-bold tracking-tight xs:text-3xl sm:text-4xl"
      >
        {title}
      </motion.h1>
      {description && (
        <motion.p
          variants={fadeInUp}
          initial="hidden"
          animate="show"
          className="max-w-2xl text-sm leading-relaxed text-muted-foreground xs:text-base"
        >
          {description}
        </motion.p>
      )}
      {children && <div className="pt-2">{children}</div>}
    </header>
  )
}
