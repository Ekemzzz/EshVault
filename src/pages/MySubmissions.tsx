// 
//   Submission status page: /submissions, signed-in only.
//  
//   Lists the current user's submissions (RLS: only rows they submitted are
//   returned) with the review state: pending, live (approved) or not approved
//   (with the admin's reason). Pending rows can be withdrawn.
//  

import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Container } from '@/components/ui/Container'
import { Badge } from '@/components/ui/Badge'
import { buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { getMySubmissions, withdrawSubmission } from '@/services/submissions.service'
import type { SubmissionSummary } from '@/services/submissions.service'
import { cn } from '@/utils/cn'

function StatusBadge({ status }: { status: SubmissionSummary['status'] }) {
  if (status === 'pending') return <Badge variant="secondary">Under review</Badge>
  if (status === 'published') return <Badge variant="accent">Live</Badge>
  if (status === 'rejected')
    return (
      <Badge variant="default" className="bg-red-500/10 text-red-600 dark:text-red-400">
        Not approved
      </Badge>
    )
  return <Badge variant="outline">{status}</Badge>
}

import { usePageMeta } from '@/lib/seo'

export function MySubmissions() {
  usePageMeta({ title: 'My submissions', noindex: true })
  const [rows, setRows] = useState<SubmissionSummary[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [confirmWithdraw, setConfirmWithdraw] = useState<string | null>(null)
  const [withdrawing, setWithdrawing] = useState(false)

  const load = useCallback(() => {
    setError(null)
    getMySubmissions()
      .then(setRows)
      .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load submissions'))
  }, [])

  useEffect(load, [load])

  async function onWithdraw(id: string): Promise<void> {
    setWithdrawing(true)
    try {
      await withdrawSubmission(id)
      setConfirmWithdraw(null)
      load()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Withdrawal failed')
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader
        eyebrow="Your contributions"
        title="My submissions"
        description="Everything you've submitted, with its review status."
      >
        <Link to="/submit" className={buttonStyles('primary', 'md')}>
          Submit another
        </Link>
      </PageHeader>

      {error && (
        <div className="mb-4 max-w-2xl">
          <AuthMessage kind="error">{error}</AuthMessage>
        </div>
      )}

      {rows === null && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your submissions…
        </p>
      )}

      {rows && rows.length === 0 && (
        <div className="w-full max-w-2xl rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            You haven't submitted anything yet. Know a great extension?{' '}
            <Link to="/submit" className="font-medium text-primary underline">
              Submit it
            </Link>
            .
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <ul className="max-w-2xl space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-border bg-card p-4 xs:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-base font-semibold">{r.name}</span>
                    <StatusBadge status={r.status} />
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {r.categoryLabel ? `${r.categoryLabel} · ` : ''}
                    submitted{' '}
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                  {r.status === 'rejected' && r.rejectionReason && (
                    <p className="mt-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
                      <ThumbsDown className="mr-1 inline h-4 w-4" />
                      <span className="font-medium text-foreground">Admin note:</span>{' '}
                      {r.rejectionReason}
                      {r.reviewedAt && (
                        <span className="ml-1 text-xs">
                          ({new Date(r.reviewedAt).toLocaleDateString()})
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {r.status === 'published' && (
                    <Link
                      to={`/extensions/${r.slug}`}
                      className={buttonStyles('outline', 'sm')}
                    >
                      <ThumbsUp className="mr-1 h-4 w-4" /> View live
                    </Link>
                  )}
                  {r.status === 'pending' &&
                    (confirmWithdraw === r.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          className={buttonStyles('destructive', 'sm')}
                          disabled={withdrawing}
                          onClick={() => onWithdraw(r.id)}
                        >
                          {withdrawing ? (
                            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="mr-1 h-4 w-4" />
                          )}
                          Confirm withdraw
                        </button>
                        <button
                          className={cn(buttonStyles('ghost', 'sm'))}
                          onClick={() => setConfirmWithdraw(null)}
                        >
                          Keep
                        </button>
                      </div>
                    ) : (
                      <button
                        className={buttonStyles('ghost', 'sm')}
                        onClick={() => setConfirmWithdraw(r.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" /> Withdraw
                      </button>
                    ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
