
//  Admin tab: review moderation.
 
//  Newest reviews across the whole directory (RLS lets admins read all rows),
//  with delete for spam/abuse. 


import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Star, Trash2 } from 'lucide-react'
import type { AdminReviewRow } from '@/services/admin.service'
import { adminDeleteReview, listAllReviews } from '@/services/admin.service'
import { buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { Badge } from '@/components/ui/Badge'
import { errorMessage, formatDate } from './common'
import { cn } from '@/utils/cn'

export function ReviewsTab() {
  const [rows, setRows] = useState<AdminReviewRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    listAllReviews()
      .then(setRows)
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  async function onDelete(id: string): Promise<void> {
    setBusyId(id)
    setError(null)
    try {
      await adminDeleteReview(id)
      setConfirmId(null)
      load()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error && <AuthMessage kind="error">{error}</AuthMessage>}

      {!rows && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviews…
        </p>
      )}

      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          No reviews yet.
        </div>
      )}

      {rows && rows.length > 0 && (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {r.rating.toFixed(1)}
                    </span>
                    {r.title && <span className="font-medium">{r.title}</span>}
                    {r.extensionName &&
                      (r.extensionSlug ? (
                        <Link
                          to={`/extensions/${r.extensionSlug}`}
                          className="focus-ring rounded text-xs font-medium text-primary hover:underline"
                        >
                          on {r.extensionName}
                        </Link>
                      ) : (
                        <Badge variant="outline">{r.extensionName}</Badge>
                      ))}
                    <span className="text-xs text-muted-foreground">
                      {r.authorName} · {formatDate(r.createdAt)}
                    </span>
                  </p>
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted-foreground">{r.body}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {confirmId === r.id ? (
                    <>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => onDelete(r.id)}
                        className={cn(buttonStyles('destructive', 'sm'), 'h-11 min-w-[44px]')}
                      >
                        {busyId === r.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Confirm delete'
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmId(null)}
                        className={cn(buttonStyles('ghost', 'sm'), 'h-11 min-w-[44px]')}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete review by ${r.authorName}`}
                      onClick={() => setConfirmId(r.id)}
                      className={cn(
                        buttonStyles('ghost', 'sm'),
                        'h-11 w-11 min-w-[44px] justify-center px-0 text-red-500 hover:text-red-600',
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
