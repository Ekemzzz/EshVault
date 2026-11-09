// CompareBar:floating comparison panel.
//   Fixed bottom tray with up to three slots, a Compare action (enabled at 2+) and Clear.
//  Renders nothing when the tray is empty or on the /compare page itself.
//  Plain conditional rendering (no exit-animation gate).
 
import { Link, useLocation } from 'react-router-dom'
import { Scale, Trash2, X } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { Button, buttonStyles } from '@/components/ui/Button'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { useCompare, MAX_COMPARE } from '@/hooks/useCompare'
import { cn } from '@/utils/cn'

export function CompareBar() {
  const { entries, count, remove, clear } = useCompare()
  const { pathname } = useLocation()

  if (count === 0 || pathname === '/compare') return null

  const compareHref = `/compare?slugs=${entries.map((e) => encodeURIComponent(e.slug)).join(',')}`

  return (
    <div
      role="region"
      aria-label="Comparison tray"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-[0_-6px_20px_rgba(0,0,0,0.10)] backdrop-blur"
    >
      <Container className="flex items-center gap-3 py-3">
        <span className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold xs:flex">
          <Scale className="h-4 w-4 text-primary" />
          Compare
        </span>

        
        <ol className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-0.5">
          {Array.from({ length: MAX_COMPARE }).map((_, i) => {
            const entry = entries[i]
            if (!entry) {
              return (
                <li
                  key={`empty-${i}`}
                  aria-hidden
                  className="hidden h-11 w-28 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground/60 sm:flex"
                >
                  Add
                </li>
              )
            }
            return (
              <li
                key={entry.slug}
                className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border bg-background pl-2 pr-1"
              >
                <ExtensionIcon name={entry.name} slug={entry.slug} iconUrl={entry.iconUrl} className="h-6 w-6" />
                <span className="max-w-[14ch] truncate text-sm font-medium">{entry.name}</span>
                <button
                  type="button"
                  onClick={() => remove(entry.slug)}
                  aria-label={`Remove ${entry.name} from comparison`}
                  className={cn(
                    'focus-ring grid h-11 w-11 place-items-center rounded-md text-muted-foreground',
                    'transition-colors hover:text-foreground',
                  )}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            )
          })}
        </ol>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clear}
            aria-label="Clear comparison"
            className="focus-ring inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          {count >= 2 ? (
            <Link to={compareHref} className={buttonStyles('primary', 'sm', 'min-h-[44px] items-center')}>
              Compare ({count})
            </Link>
          ) : (
            <span title="Pick at least two extensions to compare">
              <Button size="sm" disabled className="min-h-[44px]">
                Compare ({count})
              </Button>
            </span>
          )}
        </div>
      </Container>
    </div>
  )
}
