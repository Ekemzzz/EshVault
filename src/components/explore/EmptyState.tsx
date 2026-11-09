import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
  onReset: () => void
  hasActiveFilters: boolean
}

export function EmptyState({ onReset, hasActiveFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card/40 px-4 py-12 text-center xs:px-6 xs:py-14">
      <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground">
        <SearchX className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold">No matching extensions</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Try a different keyword, or loosen some of the filters to see more results.
      </p>
      {hasActiveFilters && (
        <Button variant="outline" className="mt-5" onClick={onReset}>
          Clear all filters
        </Button>
      )}
    </div>
  )
}

export function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center rounded-2xl border border-border/60 bg-card/40 px-4 py-12 text-sm text-muted-foreground xs:px-6 xs:py-14"
    >
      <span className="mr-3 inline-block h-3 w-3 animate-pulse rounded-full bg-primary/70" />
      Finding extensions…
    </div>
  )
}
