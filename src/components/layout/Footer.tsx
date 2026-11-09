import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { Logo } from '@/components/common/Logo'
import { footerNavigation } from '@/constants/navigation'
import { categories } from '@/data/extensions'
import { env } from '@/lib/env'

// Real, in-product destinations, no placeholder social links.
const contributeLinks = [
  { label: 'Submit an extension', to: '/submit' },
  { label: 'Compare extensions', to: '/compare' },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30">
      <Container className="pt-10 pb-[max(2.5rem,calc(2.5rem_+_env(safe-area-inset-bottom)))] xs:pt-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              Discover, compare, and submit the best browser extensions to make the web better.
            </p>
          </div>

          <nav aria-label="Footer">
            <h2 className="text-sm font-semibold">Explore</h2>
            <ul className="mt-3 space-y-2">
              {footerNavigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Footer categories">
            <h2 className="text-sm font-semibold">Categories</h2>
            <ul className="mt-3 space-y-2">
              {categories.slice(0, 4).map((c) => (
                <li key={c.slug}>
                  <Link
                    to={`/categories/${c.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Contribute">
            <h2 className="text-sm font-semibold">Contribute</h2>
            <ul className="mt-3 space-y-2">
              {contributeLinks.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 border-t border-border/60 pt-6 text-center text-sm text-muted-foreground xs:mt-10">
          <p>
            &copy; {year} {env.appName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  )
}
