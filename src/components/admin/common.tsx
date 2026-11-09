/**
 * Shared admin-dashboard bits.
 */
import type { ExtensionStatus } from '@/types/database'
import { Badge } from '@/components/ui/Badge'

/** Shared input/select styling for admin controls (matches the form system). */
export const inputStyles =
  'focus-ring min-h-[44px] rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60'

const STATUS_META: Record<ExtensionStatus, { label: string; cls: string }> = {
  draft: { label: 'Draft', cls: 'bg-muted text-muted-foreground' },
  pending: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-700 dark:text-amber-300' },
  published: { label: 'Published', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' },
  archived: { label: 'Archived', cls: 'bg-muted text-muted-foreground' },
  rejected: { label: 'Rejected', cls: 'bg-red-500/15 text-red-700 dark:text-red-300' },
}

export function StatusChip({ status }: { status: ExtensionStatus }) {
  const meta = STATUS_META[status] ?? STATUS_META.draft
  return <Badge variant="default" className={meta.cls}>{meta.label}</Badge>
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function errorMessage(e: unknown): string {
  return e instanceof Error ? e.message : 'Something went wrong.'
}
