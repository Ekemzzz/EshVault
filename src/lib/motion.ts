import type { Variants } from 'framer-motion'

export const easeOutQuint = [0.22, 1, 0.36, 1]

//  Route/page enter animation used by PageTransition.
//  Transform-only on purpose: never animates opacity from 0, so content stays
//  visible even if requestAnimationFrame is throttled (backgrounded/preview). */
export const pageTransition: Variants = {
  initial: { y: 12 },
  enter: {
    y: 0,
    transition: { duration: 0.4, ease: easeOutQuint },
  },
  exit: {
    y: -8,
    transition: { duration: 0.25, ease: 'easeIn' },
  },
}

// Staggered container for lists of motion children. 
export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
}

export const fadeInUp: Variants = {
  hidden: { y: 16 },
  show: { y: 0, transition: { duration: 0.4, ease: easeOutQuint } },
}
