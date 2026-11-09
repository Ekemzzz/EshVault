import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  total: number
  pageSize: number
  onChange: (page: number) => void
  className?: string
}


//  * Compact pagination. Renders prev / numbered (windowed) / next.
//  * Also shows the visible range out of total, e.g. "Showing 1–9 of 42".
 
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
  className,
}: PaginationProps) {
  if (total <= 0) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, total)
  const window = pageWindow(page, totalPages)

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        // Stacks and centres on phones: the range line plus a wrapping row of
        // 44px targets, instead of one overflowing horizontal strip.
        'flex flex-col items-center justify-between gap-3 text-center xs:flex-row xs:text-left',
        className,
      )}
    >
      <p className="text-xs text-muted-foreground sm:text-sm">
        Showing <span className="font-medium text-foreground">{start}</span>–
        <span className="font-medium text-foreground">{end}</span> of{' '}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex max-w-full flex-wrap items-center justify-center gap-1 xs:justify-end">
        <PageButton
          ariaLabel="Previous page"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </PageButton>

        {window.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-muted-foreground">
              …
            </span>
          ) : (
            <PageButton
              key={p}
              active={p === page}
              onClick={() => onChange(p as number)}
              ariaLabel={`Go to page ${p}`}
              ariaCurrent={p === page ? 'page' : undefined}
            >
              {p}
            </PageButton>
          ),
        )}

        <PageButton
          ariaLabel="Next page"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </PageButton>
      </div>
    </nav>
  )
}

function PageButton({
  children,
  active,
  disabled,
  onClick,
  ariaLabel,
  ariaCurrent,
}: {
  children: React.ReactNode
  active?: boolean
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
  ariaCurrent?: 'page'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cn(
        'inline-flex h-11 min-w-[2.75rem] items-center justify-center rounded-md border px-2 text-sm font-medium transition-colors xs:h-9 xs:min-w-[2.25rem]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-background hover:bg-accent hover:text-accent-foreground',
        disabled && 'cursor-not-allowed opacity-40 hover:bg-transparent',
      )}
    >
      {children}
    </button>
  )
}


function pageWindow(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '…')[] = []
  out.push(1)
  const left = Math.max(2, current - 1)
  const right = Math.min(total - 1, current + 1)
  if (left > 2) out.push('…')
  for (let p = left; p <= right; p++) out.push(p)
  if (right < total - 1) out.push('…')
  out.push(total)
  return out
}
