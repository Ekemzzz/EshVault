/**
 * Admin tab.
  Writing goes through the admin RLS policies,
 * so this whole tab is read-only-empty for non-admins even if reached.
 */
import { useCallback, useEffect, useState } from 'react'
import { Loader2, Pencil, Plus, Star, Trash2, X } from 'lucide-react'
import type { ExtensionStatus } from '@/types/database'
import type { AdminExtensionDetail, AdminExtensionRow } from '@/services/admin.service'
import {
  deleteExtension,
  getAdminExtensionDetail,
  listAllExtensions,
  toggleFeatured,
} from '@/services/admin.service'
import { ExtensionForm } from '@/components/extensions/ExtensionForm'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { inputStyles } from '@/components/admin/common'
import { StatusChip, errorMessage, formatDate } from './common'
import { cn } from '@/utils/cn'

const STATUS_FILTERS: Array<ExtensionStatus | 'all'> = [
  'all',
  'published',
  'pending',
  'rejected',
  'draft',
  'archived',
]

export function ExtensionsTab() {
  const [rows, setRows] = useState<AdminExtensionRow[] | null>(null)
  const [status, setStatus] = useState<ExtensionStatus | 'all'>('all')
  const [query, setQuery] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  // Editor: null = closed, 'new' = create, otherwise detail for edit.
  const [editor, setEditor] = useState<'new' | AdminExtensionDetail | null>(null)
  const [editorLoading, setEditorLoading] = useState(false)

  const load = useCallback(() => {
    setError(null)
    listAllExtensions({ status, query })
      .then(setRows)
      .catch((e: unknown) => setError(errorMessage(e)))
  }, [status, query])

  useEffect(() => {
    const t = setTimeout(load, query ? 300 : 0)
    return () => clearTimeout(t)
  }, [load, query])

  async function onToggleFeatured(row: AdminExtensionRow): Promise<void> {
    setBusyId(row.id)
    try {
      await toggleFeatured(row.id, !row.isFeatured)
      load()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  async function onDelete(id: string): Promise<void> {
    setBusyId(id)
    setError(null)
    try {
      await deleteExtension(id)
      setConfirmDelete(null)
      if (editor && editor !== 'new' && editor.row.id === id) setEditor(null)
      load()
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setBusyId(null)
    }
  }

  async function onEdit(id: string): Promise<void> {
    setEditorLoading(true)
    setError(null)
    try {
      const detail = await getAdminExtensionDetail(id)
      if (detail) setEditor(detail)
    } catch (e: unknown) {
      setError(errorMessage(e))
    } finally {
      setEditorLoading(false)
    }
  }

  if (editor) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold tracking-tight">
            {editor === 'new' ? 'New extension' : `Editing: ${editor.row.name}`}
          </h3>
          <button
            className={buttonStyles('ghost', 'sm')}
            onClick={() => setEditor(null)}
            aria-label="Close editor"
          >
            <X className="mr-1 h-4 w-4" /> Close
          </button>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 xs:p-6">
          <ExtensionForm
            mode="admin"
            initial={editor === 'new' ? null : editor}
            onCancel={() => setEditor(null)}
            onSuccess={() => {
              setEditor(null)
              load()
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="admin-ext-search" className="sr-only">
          Search extensions
        </label>
        <input
          id="admin-ext-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name…"
          className={cn(inputStyles, 'w-full sm:w-64')}
        />
        <label htmlFor="admin-ext-status" className="sr-only">
          Status filter
        </label>
        <select
          id="admin-ext-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ExtensionStatus | 'all')}
          className={cn(inputStyles, 'w-auto')}
        >
          {STATUS_FILTERS.map((f) => (
            <option key={f} value={f}>
              {f === 'all' ? 'All statuses' : f}
            </option>
          ))}
        </select>
        <Button className="ml-auto" onClick={() => setEditor('new')}>
          <Plus className="mr-2 h-4 w-4" /> New extension
        </Button>
      </div>

      {editorLoading && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading extension…
        </p>
      )}
      {error && <AuthMessage kind="error">{error}</AuthMessage>}

      {!rows && !error && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading extensions…
        </p>
      )}

      {rows && rows.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted-foreground">
          Nothing matches this filter.
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">Extension</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Installs</th>
                <th className="px-4 py-3 font-medium">Updated</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.map((r) => (
                <tr key={r.id} className="bg-card">
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2.5">
                      <ExtensionIcon name={r.name} slug={r.slug} className="h-8 w-8" />
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5">
                          <span className="max-w-[22ch] truncate font-medium">{r.name}</span>
                          {r.isFeatured && (
                            <button
                              type="button"
                              aria-label="Unfeature"
                              onClick={() => onToggleFeatured(r)}
                              className="focus-ring inline-grid h-7 w-7 place-items-center rounded text-amber-500 hover:bg-muted"
                            >
                              <Star className="h-4 w-4 fill-current" />
                            </button>
                          )}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          /{r.slug}
                          {r.categoryLabel ? ` · ${r.categoryLabel}` : ''}
                        </span>
                      </span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={r.status} />
                  </td>
                  <td className="px-4 py-3 tabular-nums">{r.downloadCount.toLocaleString()}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(r.updatedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center justify-end gap-1.5">
                      {!r.isFeatured && (
                        <button
                          type="button"
                          aria-label={`Feature ${r.name}`}
                          title="Feature on the home page"
                          disabled={busyId === r.id}
                          onClick={() => onToggleFeatured(r)}
                          className={cn(
                            buttonStyles('ghost', 'sm'),
                            'h-11 w-11 min-w-[44px] justify-center px-0',
                          )}
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        aria-label={`Edit ${r.name}`}
                        title="Edit"
                        onClick={() => onEdit(r.id)}
                        className={cn(
                          buttonStyles('ghost', 'sm'),
                          'h-11 w-11 min-w-[44px] justify-center px-0',
                        )}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {confirmDelete === r.id ? (
                        <>
                          <button
                            type="button"
                            disabled={busyId === r.id}
                            onClick={() => onDelete(r.id)}
                            className={cn(buttonStyles('destructive', 'sm'), 'h-11 min-w-[44px]')}
                          >
                            {busyId === r.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Confirm'
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDelete(null)}
                            className={cn(buttonStyles('ghost', 'sm'), 'h-11 min-w-[44px]')}
                          >
                            Keep
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          aria-label={`Delete ${r.name}`}
                          title="Delete"
                          onClick={() => setConfirmDelete(r.id)}
                          className={cn(
                            buttonStyles('ghost', 'sm'),
                            'h-11 w-11 min-w-[44px] justify-center px-0 text-red-500 hover:text-red-600',
                          )}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
