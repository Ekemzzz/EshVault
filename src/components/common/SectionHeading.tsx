import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { fadeInUp } from '@/lib/motion'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  action?: { label: string; to: string }
  className?: string
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
        className,
      )}
    >
      <div>
        {eyebrow && (
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-sm font-semibold uppercase tracking-wide text-primary"
          >
            {eyebrow}
          </motion.p>
        )}
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mt-1 break-words text-xl font-bold tracking-tight xs:text-2xl sm:text-3xl"
        >
          {title}
        </motion.h2>
        {description && (
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted-foreground xs:text-sm">{description}</p>
        )}
      </div>

      {action && (
        <Link
          to={action.to}
          className="focus-ring group -mx-1 inline-flex min-h-[44px] shrink-0 items-center gap-1 self-start rounded-md px-1 text-sm font-medium text-primary hover:underline xs:self-auto"
        >
          {action.label}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
