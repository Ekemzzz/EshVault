
import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
import type { CategoryAdminRow } from '@/services/admin.service'
import {
  deleteCategory,
  getCategoryRows,
  insertCategory,
  updateCategory,
} from '@/services/admin.service'
import type { CategoryInput } from '@/services/admin.service'
import { SLUG_PATTERN } from '@/services/submissions.service'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { errorMessage, inputStyles } from './common'
import { cn } from '@/utils/cn'

const emptyDraft: CategoryInput = { slug: '', label: '', blurb: '', sortOrder: 0 }

function CategoryFields({
  draft,
  onChange,
  error,
}: {
  draft: CategoryInput
  onChange: (d: CategoryInput) => void
  error?: string
}) {
  return (
    <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_1.4fr_80px]">
      <label className="block">
        <span className="sr-only">Label</span>
        <input
          aria-label="Category label"
          value={draft.label}
          onChange={(e) => onChange({ ...draft, label: e.target.value })}
          placeholder="Label (e.g. Developer tools)"
          className={cn(inputStyles, 'w-full')}
        />
      </label>
      <label className="block">
        <span className="sr-only">Slug</span>
        <input
          aria-label="Category slug"
          value={draft.slug}
          onChange={(e) => onChange({ ...draft, slug: e.target.value.toLowerCase() })}
          placeholder="slug (developer-tools)"
          className={cn(inputStyles, 'w-full')}
        />
      </label>
      <label className="block">
        <span className="sr-only">Blurb</span>
        <input
          aria-label="Category blurb"
          value={draft.blurb ?? ''}
          onChange={(e) => onChange({ ...draft, blurb: e.target.value })}
          placeholder="Blurb (optional)"
          className={cn(inputStyles, 'w-full')}
        />
      </label>
      <label className="block">
        <span className="sr-only">Sort order</span>
        <input
          aria-label="Sort order"
          type="number"
          value={draft.sortOrder}
          onChange={(e) => onChange({ ...draft, sortOrder: Number(e.target.value) })}
          className={cn(inputStyles, 'w-full')}
        />
      </label>
      {error && <p className="text-xs text-red-600 sm:col-span-4">{error}</p>}
    </div>
  )
}

export function CategoriesTab() {
  const [rows, setRows] = useState<CategoryAdminRow[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [draft, setDraft] = useState<CategoryInput>(emptyDraft)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    setError(null)
    getCategoryRows()
      .then(setRows)
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [])

  useEffect(load, [load])

  function validate(d: CategoryInput): boolean {
    if (d.label.trim().length < 2) {
      setFieldError('Label must be at least 2 characters.')
      return false
    }
    if (!SLUG_PATTERN.test(d.slug)) {
      setFieldError('Slug: lowercase letters/numbers with single dashes.')
      return false
    }
    setFieldError(null)
    return true
  }

  async function onSaveNew(): Promise<void> {
    if (!validate(draft)) return
    setBusy(true)
    setError(null)
    try {
      await insertCategory({ ...draft, label: draft.label.trim(), blurb: draft.blurb?.trim() || null })
      setCreating(false)
      setDraft(emptyDraft)
      load()
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      setError(err.code === '23505' ? 'That slug is already taken.' : errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function onSaveEdit(row: CategoryAdminRow): Promise<void> {
    if (!validate(draft)) return
    setBusy(true)
    setError(null)
    try {
      await updateCategory(row.id, { ...draft, label: draft.label.trim(), blurb: draft.blurb?.trim() || null })
      setEditingId(null)
      load()
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      setError(err.code === '23505' ? 'That slug is already taken.' : errorMessage(e))
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string): Promise<void> {
    setBusy(true)
    setError(null)
    try {
      await deleteCategory(id)
      setConfirmDelete(null)
      load()
    } catch (e: unknown) {
      const err = e as { code?: string }
      setError(
        err.code === '23503'
          ? 'This category still has extensions. Move them first.'
          : errorMessage(e),
      )
    } finally {
      setBusy(false)
    }
  }

  function startEdit(row: CategoryAdminRow): void {
    setEditingId(row.id)
    setCreating(false)
    setDraft({ slug: row.slug, label: row.label, blurb: row.blurb ?? '', sortOrder: row.sortOrder })
  }

  return (
    <div className="space-y-4">
      {error && <AuthMessage kind="error">{error}</AuthMessage>}

      {!rows && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
        </p>
      )}

      {rows && (
        <ul className="space-y-3">
          {rows.map((row) =>
            editingId === row.id ? (
              <li key={row.id} className="rounded-2xl border border-primary/40 bg-card p-4">
                <div className="flex flex-col gap-3">
                  <CategoryFields
                    draft={draft}
                    onChange={setDraft}
                    error={fieldError ?? undefined}
                  />
                  <div className="flex gap-2">
                    <Button size="sm" disabled={busy} onClick={() => onSaveEdit(row)}>
                      {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save
                    </Button>
                    <button className={buttonStyles('ghost', 'sm')} onClick={() => setEditingId(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </li>
            ) : (
              <li
                key={row.id}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-card p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">
                    {row.label}{' '}
                    <span className="ml-1 text-xs font-normal text-muted-foreground">
                      /{row.slug} · order {row.sortOrder}
                    </span>
                  </p>
                  {row.blurb && <p className="truncate text-xs text-muted-foreground">{row.blurb}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${row.label}`}
                    onClick={() => startEdit(row)}
                    className={cn(buttonStyles('ghost', 'sm'), 'h-11 w-11 min-w-[44px] justify-center px-0')}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  {confirmDelete === row.id ? (
                    <>
                      <button
                        disabled={busy}
                        onClick={() => onDelete(row.id)}
                        className={cn(buttonStyles('destructive', 'sm'), 'h-11 min-w-[44px]')}
                      >
                        Confirm delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(null)}
                        className={cn(buttonStyles('ghost', 'sm'), 'h-11 min-w-[44px]')}
                      >
                        Keep
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete ${row.label}`}
                      onClick={() => setConfirmDelete(row.id)}
                      className={cn(
                        buttonStyles('ghost', 'sm'),
                        'h-11 w-11 min-w-[44px] justify-center px-0 text-red-500 hover:text-red-600',
                      )}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ),
          )}

          {creating && (
            <li className="rounded-2xl border border-primary/40 bg-card p-4">
              <div className="flex flex-col gap-3">
                <CategoryFields draft={draft} onChange={setDraft} error={fieldError ?? undefined} />
                <div className="flex gap-2">
                  <Button size="sm" disabled={busy} onClick={onSaveNew}>
                    {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Add category
                  </Button>
                  <button
                    className={buttonStyles('ghost', 'sm')}
                    onClick={() => {
                      setCreating(false)
                      setDraft(emptyDraft)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </li>
          )}
        </ul>
      )}

      {rows && !creating && (
        <Button variant="outline" onClick={() => {
          setCreating(true)
          setEditingId(null)
          setDraft(emptyDraft)
        }}>
          <Plus className="mr-2 h-4 w-4" /> Add category
        </Button>
      )}
    </div>
  )
}
