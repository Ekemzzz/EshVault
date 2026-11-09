import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Container } from '@/components/ui/Container'
import { usePageMeta } from '@/lib/seo'

const features = [
  {
    title: 'Discover',
    description:
      'Browse seven categories, or filter the whole catalogue by browser, price and popularity to narrow things down fast.',
    to: '/browse',
    cta: 'Browse extensions',
  },
  {
    title: 'Compare',
    description:
      'Put up to three extensions side by side: pricing, downloads, supported browsers, permissions and ratings.',
    to: '/compare',
    cta: 'Open the compare table',
  },
  {
    title: 'Contribute',
    description:
      'Sign in to suggest an extension. Every submission is reviewed before it goes live, and you can track its status.',
    to: '/submit',
    cta: 'Suggest an extension',
  },
]

export function About() {
  usePageMeta({
    title: 'About',
    description:
      'A community-minded directory to help you discover, compare and recommend browser extensions.',
  })
  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader
        eyebrow="About"
        title="Find the right tools for your browser"
        description="A community-minded directory to help you discover, compare and recommend browser extensions."
      />

      <div className="space-y-10">
        <section aria-labelledby="how-it-works-heading">
          <h2 id="how-it-works-heading" className="text-xl font-semibold">
            A better way to explore extensions
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted-foreground">
            EshVault can make everyday tasks easier, but finding the right one takes
            time. This directory brings useful extensions together in one place, so you can
            search and filter by browser, price and popularity, compare up to three side by side,
            and keep the ones worth returning to on a saved list.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="flex flex-col rounded-xl border border-border bg-card p-4 xs:p-5"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <Link
                  to={feature.to}
                  className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-primary hover:underline"
                >
                  {feature.cta}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>

      </div>
    </Container>
  )
}
