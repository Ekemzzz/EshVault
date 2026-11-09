
//  Admin tab: submission queue.
 
//   Pending submissions with full submitted detail; approve flips the row to
//   published (instantly visible through published_extensions), reject stores a
//   reason the submitter sees on /submissions. A Rejected filter lets admins
//   revisit or approve previously-rejected rows.
 

import { useCallback, useEffect, useState } from 'react'
import { ExternalLink, Loader2, ThumbsDown, ThumbsUp } from 'lucide-react'
import type { PendingSubmission } from '@/services/admin.service'
import {
  approveSubmission,
  listSubmissions,
  rejectSubmission,
} from '@/services/admin.service'
import { getIconUrl, getScreenshotUrl } from '@/services/storage.service'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { Badge } from '@/components/ui/Badge'
import { StatusChip, errorMessage, formatDate } from './common'
import { cn } from '@/utils/cn'

interface SubmissionsTabProps {
  onQueueChanged: () => void
}

export function SubmissionsTab({ onQueueChanged }: SubmissionsTabProps) {
  const [filter, setFilter] = useState<'pending' | 'rejected'>('pending')
  const [rows, setRows] = useState<PendingSubmission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [reason, setReason] = useState('')

  const load = useCallback(() => {
    setError(null)
    listSubmissions(filter)
      .then(setRows)
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [filter])

  useEffect(load, [load])

  async function act(id: string, fn: () => Promise<void>): Promise<void> {
    setBusyId(id)
    setError(null)
    try {
      await fn()
      onQueueChanged()
      load()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setBusyId(null)
      setRejectingId(null)
      setReason('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {(['pending', 'rejected'] as const).map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cn(
              'focus-ring min-h-[44px] rounded-full border px-4 text-sm font-medium transition-colors',
              filter === f
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card hover:bg-muted',
            )}
          >
            {f === 'pending' ? 'Under review' : 'Rejected'}
          </button>
        ))}
      </div>

      {error && <AuthMessage kind="error">{error}</AuthMessage>}

      {!rows && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading the queue…
        </p>
      )}

      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          {filter === 'pending'
            ? 'No submissions waiting. The queue is clear.'
            : 'Nothing has been rejected.'}
        </div>
      )}

      {rows?.map((s) => (
        <article key={s.id} className="rounded-2xl border border-border bg-card p-4 xs:p-5">
          <div className="flex flex-wrap items-start gap-4">
            <ExtensionIcon name={s.name} slug={s.slug} iconUrl={s.iconPath ? getIconUrl(s.iconPath) : undefined} className="h-12 w-12" />
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2">
                <span className="text-base font-semibold">{s.name}</span>
                <StatusChip status={s.status} />
                <Badge variant="outline" className="capitalize">{s.pricing}</Badge>
                {s.categoryLabel && <Badge variant="secondary">{s.categoryLabel}</Badge>}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                /{s.slug} · submitted {formatDate(s.createdAt)}
              </p>
              {s.tagline && <p className="mt-2 text-sm italic text-muted-foreground">{s.tagline}</p>}
              {s.browserSlugs.length > 0 && (
                <p className="mt-2 flex flex-wrap gap-1.5">
                  {s.browserSlugs.map((b) => (
                    <Badge key={b} variant="outline" className="capitalize">
                      {b}
                    </Badge>
                  ))}
                </p>
              )}
              <a
                href={s.storeUrl ?? '#'}
                target="_blank"
                rel="noreferrer"
                className="focus-ring mt-2 inline-flex min-h-[44px] items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Store listing <ExternalLink className="h-4 w-4" />
              </a>
              {s.screenshotPaths.length > 0 && (
                <ul className="mt-3 flex flex-wrap gap-2">
                  {s.screenshotPaths.map((p) => (
                    <li key={p}>
                      <img
                        src={getScreenshotUrl(p)}
                        alt=""
                        className="h-16 w-24 rounded-lg border border-border object-cover"
                      />
                    </li>
                  ))}
                </ul>
              )}
              {s.description && (
                <details className="mt-3">
                  <summary className="focus-ring inline-flex min-h-[44px] cursor-pointer text-sm font-medium">
                    Full description
                  </summary>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                    {s.description}
                  </p>
                </details>
              )}
              {s.status === 'rejected' && s.rejectionReason && (
                <p className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                  Rejected: {s.rejectionReason}
                </p>
              )}
            </div>

            <div className="flex shrink-0 flex-col items-stretch gap-2">
              <Button
                disabled={busyId === s.id}
                onClick={() => act(s.id, () => approveSubmission(s.id))}
              >
                {busyId === s.id ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ThumbsUp className="mr-2 h-4 w-4" />
                )}
                {s.status === 'pending' ? 'Approve' : 'Approve now'}
              </Button>
              {s.status === 'pending' &&
                (rejectingId === s.id ? (
                  <div className="w-60 space-y-2 rounded-lg border border-border p-2">
                    <label htmlFor={`reason-${s.id}`} className="text-xs font-medium">
                      Reason (shown to the submitter)
                    </label>
                    <textarea
                      id={`reason-${s.id}`}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      placeholder="e.g. Duplicate of an existing entry."
                      className="focus-ring w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-sm"
                    />
                    <div className="flex gap-2">
                      <button
                        className={cn(
                          buttonStyles('destructive', 'sm'),
                          reason.trim().length < 5 && 'pointer-events-none opacity-50',
                        )}
                        disabled={busyId === s.id || reason.trim().length < 5}
                        onClick={() =>
                          act(s.id, () => rejectSubmission(s.id, reason.trim()))
                        }
                      >
                        Confirm reject
                      </button>
                      <button
                        className={buttonStyles('ghost', 'sm')}
                        onClick={() => {
                          setRejectingId(null)
                          setReason('')
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    className={buttonStyles('outline', 'md')}
                    disabled={busyId === s.id}
                    onClick={() => setRejectingId(s.id)}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" /> Reject
                  </button>
                ))}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
