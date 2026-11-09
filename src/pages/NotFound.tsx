import { Link } from 'react-router-dom'
import { Home as HomeIcon } from 'lucide-react'
import { buttonStyles } from '@/components/ui/Button'
import { usePageMeta } from '@/lib/seo'

export function NotFound() {
  usePageMeta({ title: 'Page not found', noindex: true })
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-12 text-center xs:px-0 xs:py-16">
      <p className="text-6xl font-extrabold text-primary xs:text-7xl">404</p>
      <h1 className="mt-4 text-xl font-bold xs:text-2xl">Page not found</h1>
      <p className="mt-2 text-sm text-muted-foreground xs:text-base">
        The page you are looking for doesn&apos;t exist or has been moved.
      </p>
      <Link to="/" className={buttonStyles('primary', 'lg', 'mt-6')}>
        <HomeIcon className="h-5 w-5" />
        Back home
      </Link>
    </div>
  )
}
