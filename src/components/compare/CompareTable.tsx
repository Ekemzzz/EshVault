//  CompareTable: side-by-side comparison.
 
//    ne attribute column (sticky on narrow screens) + up to three extension columns.
//    Rows whose normalized value is identical across all columns are "same"
//     (dimmed; hidden in differences-only mode). In differing rows, cells with a *unique* value get a highlight ring, and rows with a measurable "best" (installs, pricing tier) badge the unique winner.
 
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Check, Minus, X } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { browsers as allBrowsers, categoryBySlug, formatCount } from '@/data/extensions'
import { pricingLabel } from '@/constants/filters'
import type { Extension, Pricing } from '@/types'
import { cn } from '@/utils/cn'


const PRICING_BEST: Record<Pricing, number> = { free: 2, freemium: 1, paid: 0 }

interface RowDef {
  label: string
  //  Normalized value used for sameness/difference detection.
  value: (e: Extension) => string
  cell: (e: Extension) => ReactNode
  // Higher is better; a unique maximum earns the "Best" badge.
  best?: (e: Extension) => number | null
  //  Hidden entirely when every selected extension lacks a real value.
  optional?: boolean
}

const num = (v: number | undefined | null): number | null =>
  typeof v === 'number' && Number.isFinite(v) ? v : null

const ROWS: RowDef[] = [
  {
    label: 'Category',
    value: (e) => e.category,
    cell: (e) => categoryBySlug(e.category).label,
  },
  {
    label: 'Pricing',
    value: (e) => e.pricing ?? 'unknown',
    cell: (e) => (e.pricing ? pricingLabel(e.pricing) : 'Not set'),
    best: (e) => (e.pricing ? PRICING_BEST[e.pricing] : null),
  },
  {
    label: 'Installs',
    value: (e) => String(e.downloadCount ?? 'none'),
    cell: (e) => (e.downloadCount == null ? 'Not set' : formatCount(e.downloadCount)),
    best: (e) => num(e.downloadCount),
  },
  {
    label: 'Supported browsers',
    value: (e) => [...e.browsers].sort().join(','),
    cell: (e) => (
      <span className="flex flex-wrap gap-1.5" role="status" aria-label={e.browsers.join(', ')}>
        {allBrowsers.map((b) => {
          const ok = e.browsers.includes(b.slug)
          return (
            <span
              key={b.slug}
              title={b.label}
              className={cn(
                'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs',
                ok ? 'bg-muted text-foreground' : 'text-muted-foreground/50',
              )}
            >
              {ok ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
              {b.label}
            </span>
          )
        })}
      </span>
    ),
  },
  {
    label: 'Author',
    value: (e) => e.author?.name ?? 'none',
    cell: (e) => e.author?.name ?? 'Unknown',
    optional: true,
  },
  {
    label: 'Features',
    value: (e) => String(e.features?.length ?? 0),
    cell: (e) => `${e.features?.length ?? 0}`,
  },
  {
    label: 'Permissions',
    value: (e) => String(e.permissions?.length ?? 0),
    cell: (e) => `${e.permissions?.length ?? 0}`,
  },
  {
    label: 'Screenshots',
    value: (e) => String(e.screenshotUrls?.length ?? 0),
    cell: (e) => `${e.screenshotUrls?.length ?? 0}`,
  },
  {
    label: 'Store link',
    value: (e) => e.storeUrl ?? 'none',
    cell: (e) =>
      e.storeUrl ? (
        <a
          href={e.storeUrl}
          target="_blank"
          rel="noopener noreferrer nofollow"
          className="focus-ring rounded-md text-sm font-medium text-primary hover:underline"
        >
          Open store page
        </a>
      ) : (
        'Not listed'
      ),
    optional: true,
  },
]

interface CompareTableProps {
  items: Extension[]
  //  Only true when 2+ columns exist; with one column everything is "same". 
  diffable: boolean
  differencesOnly: boolean
  onRemove: (slug: string) => void
}

export function CompareTable({ items, diffable, differencesOnly, onRemove }: CompareTableProps) {
  // Precompute per-row: value frequencies + unique best winner index.
  const rows = ROWS.map((row) => {
    const values = items.map((it) => row.value(it))
    const counts = new Map<string, number>()
    values.forEach((v) => counts.set(v, (counts.get(v) ?? 0) + 1))
    const allSame = diffable && values.every((v) => v === values[0])
    const differs = diffable && !allSame
    // Optional rows whose only value across every column is the 'none'
    // sentinel would just render a row of dashes: drop them entirely.
    const empty = row.optional && values.every((v) => v === 'none')

    let bestIdx = -1
    if (row.best && differs) {
      const scores = items.map((it) => row.best?.(it) ?? null)
      const defined = scores.filter((s): s is number => s != null)
      const max = Math.max(...defined)
      // Badge only a *unique* winner that actually differs from the rest.
      const winners = scores.filter((s) => s === max).length
      if (defined.length >= 2 && new Set(defined).size > 1 && winners === 1) {
        bestIdx = scores.indexOf(max)
      }
    }
    return { row, values, counts, allSame, differs, bestIdx, empty }
  })

  const populated = rows.filter((r) => !r.empty)
  const visible = differencesOnly ? populated.filter((r) => r.differs) : populated

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm">
        <caption className="sr-only">
          Side-by-side comparison of {items.length} {items.length === 1 ? 'extension' : 'extensions'}
        </caption>
        <thead>
          <tr>
            <th scope="col" className="sticky left-0 z-10 w-40 xs:w-44 bg-card p-3 text-left align-bottom text-xs uppercase tracking-wider text-muted-foreground xs:p-4">
              Attribute
            </th>
            {items.map((ext) => (
              <th key={ext.id} scope="col" className="min-w-[190px] p-3 text-left align-bottom xs:p-4">
                <div className="flex items-start gap-2">
                  <ExtensionIcon name={ext.name} slug={ext.slug} iconUrl={ext.iconUrl} className="h-9 w-9 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/extensions/${ext.slug}`}
                      className="focus-ring rounded-md font-semibold leading-tight hover:text-primary hover:underline"
                    >
                      {ext.name}
                    </Link>
                    <p className="mt-0.5 line-clamp-1 text-xs font-normal text-muted-foreground">{ext.tagline}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(ext.slug)}
                    aria-label={`Remove ${ext.name} from comparison`}
                    className="focus-ring -mr-1 grid h-11 w-11 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visible.map(({ row, values, counts, allSame, differs, bestIdx }) => (
            <tr
              key={row.label}
              className={cn('border-t border-border', allSame && 'opacity-55')}
              data-row-state={allSame ? 'same' : differs ? 'differs' : undefined}
            >
              <th
                scope="row"
                className="sticky left-0 z-10 bg-card p-3 text-left font-medium text-muted-foreground xs:p-4"
              >
                {row.label}
              </th>
              {items.map((ext, i) => {
                const unique = differs && (counts.get(values[i]) ?? 0) === 1
                return (
                  <td key={ext.id} className={cn('p-3 align-top xs:p-4', i === 1 && 'border-l border-border/60')}>
                    <span
                      className={cn(
                        'inline-block max-w-full rounded-md px-2 py-1',
                        unique && 'bg-primary/10 ring-1 ring-primary/30',
                      )}
                    >
                      {row.cell(ext)}
                    </span>
                    {bestIdx === i && (
                      <Badge variant="accent" className="ml-1 align-middle">
                        Best
                      </Badge>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={items.length + 1} className="p-6 text-center text-muted-foreground">
                No differing attributes. These extensions look identical on every row we compare.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
