import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { pageTransition } from '@/lib/motion'


//  Wraps page content with a subtle enter/exit animation.
//  Combine with <AnimatePresence> in the router outlet for transitions.
 
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={pageTransition} initial="initial" animate="enter" exit="exit">
      {children}
    </motion.div>
  )
}
