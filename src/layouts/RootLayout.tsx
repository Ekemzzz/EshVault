import { Suspense, useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigationType } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { CompareBar } from '@/components/compare/CompareBar'
import { PageFallback } from '@/components/common/PageFallback'
import { useCompare } from '@/hooks/useCompare'
import { cn } from '@/utils/cn'

/**
 * Scroll handling for the routed area.
 *
 * A fresh route change starts at the top of the page; paging or filtering
 * keeps the view still. Going back or forward returns to the offset that URL
 * had, retried over a few frames because listing pages fetch their cards
 * first and are briefly too short to hold the saved offset.
 */
function ScrollManager() {
  const { pathname, search, key } = useLocation()
  const navigationType = useNavigationType()
  const offsets = useRef(new Map<string, number>())
  const lastPath = useRef(pathname)
  const url = pathname + search

  // Track where the visitor is on the page they are about to leave.
  useEffect(() => {
    const save = () => offsets.current.set(url, window.scrollY)
    save()
    window.addEventListener('scroll', save, { passive: true })
    return () => {
      save()
      window.removeEventListener('scroll', save)
    }
  }, [url])

  useEffect(() => {
    if (navigationType !== 'POP') {
      if (pathname !== lastPath.current) {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      }
      lastPath.current = pathname
      return
    }
    lastPath.current = pathname
    const target = offsets.current.get(url) ?? 0
    let attempts = 0
    let frame = requestAnimationFrame(function settle() {
      window.scrollTo({ top: target, behavior: 'instant' as ScrollBehavior })
      if (window.scrollY < target && attempts < 30) {
        attempts += 1
        frame = requestAnimationFrame(settle)
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [key, navigationType, pathname, url])

  return null
}

//
//   Root application layout: sticky header, routed content and footer.
//  
//   Note: route content is rendered directly (no AnimatePresence "mode=wait" gate).
//  Gating the new page on the previous page's exit animation made
//   navigation appear to "do nothing" whenever requestAnimationFrame is
//   throttled (e.g. in a backgrounded/embedded preview panel), because the
//   exit never finished and the incoming route never mounted.
//  
//   Per-page motion (section reveals, card hover, tab transitions) lives inside the pages and does not block navigation.
//  
export function RootLayout() {
  const { count } = useCompare()
  const { pathname } = useLocation()
  // The fixed tray would otherwise permanently cover the footer; reserve
  // space exactly when it renders (it hides itself on /compare).
  const trayVisible = count > 0 && pathname !== '/compare'
  return (
    <div className={cn('flex min-h-screen flex-col', trayVisible && 'pb-20')}>
      <ScrollManager />
      <Header />

      <main id="main-content" className="flex-1">
        {/* Each page manages its own Container for full-bleed layouts.
            Pages are code-split; this is the shared Suspense boundary. */}
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <CompareBar />
    </div>
  )
}
