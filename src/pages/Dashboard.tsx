import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookmarkX, Pencil, Star, ThumbsUp, Trash2 } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/common/PageHeader'
import { Button, buttonStyles } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ExtensionCard } from '@/components/extension/ExtensionCard'
import { AuthMessage, AuthField, AuthTextArea } from '@/components/auth/AuthCard'
import { cn } from '@/utils/cn'
import { listSaved, toggleSaved } from '@/services/saved.service'
import { deleteReview, getMyReviews, updateReview } from '@/services/extensions.service'
import type { Extension } from '@/types'
import type { Review as BaseReview } from '@/types'

type MyReview = BaseReview & { extensionSlug: string; extensionName: string }

const TABS = ['saved', 'reviews'] as const
type Tab = (typeof TABS)[number]

import { usePageMeta } from '@/lib/seo'

export function Dashboard() {
  usePageMeta({ title: 'Your dashboard', noindex: true })
  const [tab, setTab] = useState<Tab>('saved')
  const [saved, setSaved] = useState<Extension[]>([])
  const [reviews, setReviews] = useState<MyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | undefined>(undefined)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editRating, setEditRating] = useState('5')
  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setError(undefined)
    try {
      const [s, r] = await Promise.all([listSaved(), getMyReviews()])
      setSaved(s)
      setReviews(r)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not load your dashboard.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const onRemoveSaved = async (id: string) => {
    setBusyId(id)
    try {
      await toggleSaved(id)
      setSaved((prev) => prev.filter((e) => e.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  const startEdit = (r: MyReview) => {
    setEditingId(r.id)
    setEditRating(String(r.rating))
    setEditTitle(r.title ?? '')
    setEditBody(r.body)
  }

  const saveEdit = async (id: string) => {
    setBusyId(id)
    try {
      await updateReview(id, {
        rating: Math.min(5, Math.max(1, Number(editRating) || 5)),
        title: editTitle,
        body: editBody,
      })
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, rating: Number(editRating), title: editTitle.trim() || undefined, body: editBody.trim() }
            : r,
        ),
      )
      setEditingId(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not update the review.')
    } finally {
      setBusyId(null)
    }
  }

  const removeReview = async (id: string) => {
    setBusyId(id)
    try {
      await deleteReview(id)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <Container className="pt-6 xs:pt-8">
        <PageHeader
          eyebrow="Account"
          title="Your dashboard"
          description="Everything you've saved and reviewed, in one place."
        />
      </Container>

      <Container className="pb-10 xs:pb-14">
        {error && (
          <div className="mb-5">
            <AuthMessage kind="error">{error}</AuthMessage>
          </div>
        )}

        {/* Tabs (plain conditional rendering, no exit-animation gate) */}
        <div role="tablist" aria-label="Dashboard sections" className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'focus-ring min-h-[44px] rounded-md px-4 text-sm font-medium capitalize transition-colors',
                tab === t ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground',
              )}
            >
              {t === 'saved' ? `Saved (${saved.length})` : `My reviews (${reviews.length})`}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-muted-foreground">Loading…</p>
        ) : tab === 'saved' ? (
          saved.length === 0 ? (
            <EmptyPanel
              title="Nothing saved yet"
              body="Browse the directory and hit the bookmark button on any extension to keep it here."
              action={
                <Link to="/browse" className={buttonStyles('primary', 'sm')}>
                  Browse extensions
                </Link>
              }
            />
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3">
              {saved.map((ext) => (
                <div key={ext.id} className="space-y-2">
                  <ExtensionCard extension={ext} />
                  <button
                    type="button"
                    onClick={() => void onRemoveSaved(ext.id)}
                    disabled={busyId === ext.id}
                    className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
                  >
                    <BookmarkX className="h-3.5 w-3.5" />
                    Remove from saved
                  </button>
                </div>
              ))}
            </div>
          )
        ) : reviews.length === 0 ? (
          <EmptyPanel
            title="No reviews yet"
            body="Found an extension worth talking about? Review it on its detail page and it will show up here."
            action={
              <Link to="/browse" className={buttonStyles('primary', 'sm')}>
                Find something to review
              </Link>
            }
          />
        ) : (
          <ul className="mt-6 space-y-4">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Link
                    to={`/extensions/${r.extensionSlug}`}
                    className="focus-ring rounded-md font-semibold hover:text-primary hover:underline"
                  >
                    {r.extensionName}
                  </Link>
                  <span className="inline-flex items-center gap-1 text-sm">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {r.rating}/5
                  </span>
                </div>
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {r.helpfulCount ?? 0} {r.helpfulCount === 1 ? 'vote' : 'votes'}
                  </span>
                  <span>
                    {new Date(r.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {editingId === r.id ? (
                  <div className="mt-4 space-y-3 rounded-lg border border-border bg-muted/30 p-4">
                    <div className="w-full max-w-[180px]">
                      <label htmlFor={`rating-${r.id}`} className="text-sm font-medium">
                        Rating
                      </label>
                      <select
                        id={`rating-${r.id}`}
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        className="focus-ring mt-1 min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={String(n)}>
                            {n} / 5
                          </option>
                        ))}
                      </select>
                    </div>
                    <AuthField
                      label="Title"
                      id={`title-${r.id}`}
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={120}
                    />
                    <AuthTextArea
                      label="Review"
                      id={`body-${r.id}`}
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      maxLength={2000}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => void saveEdit(r.id)} disabled={busyId === r.id}>
                        Save changes
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEdit(r)}>
                      <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void removeReview(r.id)}
                      disabled={busyId === r.id}
                      className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  )
}

function EmptyPanel({ title, body, action }: { title: string; body: string; action: React.ReactNode }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
      <Badge variant="secondary">Empty</Badge>
      <h2 className="mt-3 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{body}</p>
      <div className="mt-5 flex justify-center">{action}</div>
    </div>
  )
}
