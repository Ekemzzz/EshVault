
  // Shared extension form.
 
  // One component, two modes:
  //   submit: the public "Contribute" form; writes are RLS-forced to
  //    status='pending' and assets upload under the submitter's own folder.
  //   admin: create/edit dialog content for /admin; status selectable and
  //    assets upload to the curated icons//screenshots/ paths.
 
  // Validation mirrors the DB constraints (slug format, name not blank,
  // bucket MIME/size limits) so users get friendly errors before the write.
 
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import type { BrowserSupport, Pricing } from '@/types'
import { BrowserLogo } from '@/components/common/BrowserLogo'
import type { ExtensionStatus } from '@/types/database'
import type { AdminExtensionDetail } from '@/services/admin.service'
import { getCategories } from '@/services/extensions.service'
import type { CategoryRow } from '@/services/extensions.service'
import { browsers } from '@/data/extensions'
import {
  SLUG_PATTERN,
  checkSlugAvailable,
  slugify,
  submitExtension,
} from '@/services/submissions.service'
import type { SubmissionInput } from '@/services/submissions.service'
import { saveExtension } from '@/services/admin.service'
import type { AdminExtensionInput } from '@/services/admin.service'
import { getIconUrl, getScreenshotUrl } from '@/services/storage.service'
import { DatabaseError } from '@/services/errors'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { cn } from '@/utils/cn'

const ICON_MAX_BYTES = 2 * 1024 * 1024 // bucket file_size_limit (0004)
const SHOT_MAX_BYTES = 5 * 1024 * 1024
const ICON_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const SHOT_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SHOTS = 3

export interface ExtensionFormResult {
  id: string
  slug: string
}

interface ExtensionFormProps {
  mode: 'submit' | 'admin'
  /** Admin edit payload (row + relations). Ignored in submit mode. */
  initial?: AdminExtensionDetail | null
  onCancel?: () => void
  onSuccess?: (result: ExtensionFormResult) => void
  submitLabel?: string
}

type SlugState = 'idle' | 'checking' | 'available' | 'taken' | 'error'

interface ShotKeep {
  path: string
  url: string
}

function validateUrls(v: string): boolean {
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

/* ------------------------------ field shells ------------------------------ */

function Field({
  label,
  id,
  error,
  hint,
  children,
  className,
}: {
  label: string
  id: string
  error?: string
  hint?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

const inputCls =
  'focus-ring min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/60'

function inputErrCls(error?: string) {
  return error ? 'border-red-400 dark:border-red-700' : undefined
}

/* --------------------------------- form ---------------------------------- */

export function ExtensionForm({ mode, initial, onCancel, onSuccess, submitLabel }: ExtensionFormProps) {
  const isAdmin = mode === 'admin'
  const editing = isAdmin && Boolean(initial)

  const [categories, setCategories] = useState<CategoryRow[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const [name, setName] = useState(initial?.row.name ?? '')
  const [slug, setSlug] = useState(initial?.row.slug ?? '')
  const [slugTouched, setSlugTouched] = useState(editing)
  const [slugState, setSlugState] = useState<SlugState>('idle')
  const [tagline, setTagline] = useState(initial?.row.tagline ?? '')
  const [description, setDescription] = useState(initial?.row.description ?? '')
  const [categoryId, setCategoryId] = useState(initial?.row.category_id ?? '')
  const [browserSlugs, setBrowserSlugs] = useState<BrowserSupport[]>(initial?.browserSlugs ?? [])
  const [pricing, setPricing] = useState<Pricing>(initial?.row.pricing ?? 'free')
  const [storeUrl, setStoreUrl] = useState(initial?.row.store_url ?? '')
  const [websiteUrl, setWebsiteUrl] = useState(initial?.row.website_url ?? '')
  const [featuresText, setFeaturesText] = useState((initial?.featureLabels ?? []).join('\n'))
  const [downloadCount, setDownloadCount] = useState(
    initial ? String(initial.row.download_count) : '',
  )
  const [status, setStatus] = useState<ExtensionStatus>(initial?.row.status ?? 'published')

  // Icon: new pick wins over the kept existing path.
  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [keptIconPath] = useState<string | null>(initial?.row.icon_path ?? null)

  // Screenshots: kept existing paths + queued new files (total <= MAX_SHOTS).
  const [keptShots, setKeptShots] = useState<ShotKeep[]>(() =>
    (initial?.screenshotPaths ?? []).map((path) => ({ path, url: getScreenshotUrl(path) })),
  )
  const [shotFiles, setShotFiles] = useState<File[]>([])
  const [shotPreviews, setShotPreviews] = useState<string[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const objectUrls = useRef<string[]>([])
  useEffect(() => () => objectUrls.current.forEach((u) => URL.revokeObjectURL(u)), [])

  useEffect(() => {
    let alive = true
    getCategories()
      .then((rows) => {
        if (!alive) return
        setCategories(rows)
        if (!editing && rows.length > 0) setCategoryId((cur) => cur || rows[0].id)
      })
      .catch((e: unknown) => {
        if (alive) setLoadError(e instanceof Error ? e.message : 'Failed to load categories')
      })
    return () => {
      alive = false
    }
  }, [editing])

  // Auto-slug from name until the user edits the slug directly.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(name))
  }, [name, slugTouched])

  // Debounced availability hint (skip while editing with an unchanged slug).
  const slugUnchangedOnEdit = editing && slug === initial?.row.slug
  useEffect(() => {
    if (!SLUG_PATTERN.test(slug) || slugUnchangedOnEdit) {
      setSlugState(SLUG_PATTERN.test(slug) ? 'idle' : slug ? 'error' : 'idle')
      return
    }
    setSlugState('checking')
    const t = setTimeout(() => {
      checkSlugAvailable(slug)
        .then((ok) => setSlugState(ok ? 'available' : 'taken'))
        .catch(() => setSlugState('error'))
    }, 400)
    return () => clearTimeout(t)
  }, [slug, slugUnchangedOnEdit])

  const totalShots = keptShots.length + shotFiles.length

  function pickImageFile(
    e: ChangeEvent<HTMLInputElement>,
    kind: 'icon' | 'shot',
  ): void {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file
    if (!file) return
    const types = kind === 'icon' ? ICON_TYPES : SHOT_TYPES
    const max = kind === 'icon' ? ICON_MAX_BYTES : SHOT_MAX_BYTES
    if (!types.includes(file.type)) {
      setErrors((p) => ({
        ...p,
        [kind]: `Use PNG, JPEG, WebP${kind === 'icon' ? ' or SVG' : ''}.`,
      }))
      return
    }
    if (file.size > max) {
      setErrors((p) => ({ ...p, [kind]: `Image is too large (max ${max / 1024 / 1024}MB).` }))
      return
    }
    setErrors((p) => ({ ...p, [kind]: '' }))
    const url = URL.createObjectURL(file)
    objectUrls.current.push(url)
    if (kind === 'icon') {
      setIconFile(file)
      setIconPreview(url)
    } else {
      if (totalShots >= MAX_SHOTS) return
      setShotFiles((p) => [...p, file])
      setShotPreviews((p) => [...p, url])
    }
  }

  function validate(): boolean {
    const next: Record<string, string> = {}
    const descRequired = mode === 'submit' || (isAdmin && status === 'published')
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters.'
    if (!SLUG_PATTERN.test(slug)) {
      next.slug = 'Lowercase letters, numbers and single dashes (e.g. my-extension).'
    } else if (slugState === 'taken') {
      next.slug = 'That slug is already taken. Pick another.'
    }
    if (tagline.trim().length > 120) next.tagline = 'Keep the tagline under 120 characters.'
    const desc = description.trim()
    if (descRequired && desc.length < 40) next.description = 'Description needs at least 40 characters.'
    if (desc.length > 2000) next.description = 'Description is capped at 2000 characters.'
    if (!categoryId) next.category = 'Choose a category.'
    if (browserSlugs.length < 1) next.browsers = 'Select at least one browser.'
    if (!storeUrl.trim()) next.storeUrl = 'A store link is required.'
    else if (!validateUrls(storeUrl.trim())) next.storeUrl = 'Must be a full http(s) URL.'
    if (websiteUrl.trim() && !validateUrls(websiteUrl.trim())) {
      next.websiteUrl = 'Must be a full http(s) URL.'
    }
    if (isAdmin && downloadCount !== '' && !/^\d+$/.test(downloadCount)) {
      next.downloadCount = 'Whole number of installs, or leave blank.'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  function friendlyError(e: unknown): string {
    if (e instanceof DatabaseError) {
      if (e.code === '23505') return 'That slug is already taken. Pick another.'
      if (e.code === '23503') return 'That category is protected. Pick another.'
      if (e.code === '42501' || e.code === 'PGRST301') return 'You do not have permission to do that.'
      return e.message
    }
    return e instanceof Error ? e.message : 'Something went wrong. Please try again.'
  }

  async function onSubmitForm(e: FormEvent): Promise<void> {
    e.preventDefault()
    setFormError(null)
    if (!validate()) return
    setBusy(true)
    try {
      const features = featuresText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 12)

      if (mode === 'submit') {
        const input: SubmissionInput = {
          name: name.trim(),
          slug,
          tagline: tagline.trim(),
          description: description.trim(),
          categoryId,
          browserSlugs,
          pricing,
          storeUrl: storeUrl.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          features,
          iconFile,
          screenshotFiles: shotFiles,
        }
        const created = await submitExtension(input)
        onSuccess?.({ id: created.id, slug: created.slug })
      } else {
        const input: AdminExtensionInput = {
          name: name.trim(),
          slug,
          tagline: tagline.trim(),
          description: description.trim(),
          categoryId,
          browserSlugs,
          pricing,
          storeUrl: storeUrl.trim(),
          websiteUrl: websiteUrl.trim() || undefined,
          features,
          status,
          downloadCount: downloadCount === '' ? undefined : Number(downloadCount),
          iconFile,
          iconPath: iconFile ? null : keptIconPath,
          screenshotFiles: shotFiles,
          screenshotPaths: keptShots.map((s) => s.path),
        }
        const saved = await saveExtension(input, editing ? initial!.row.id : undefined)
        onSuccess?.({ id: saved.id, slug })
      }
    } catch (err) {
      setFormError(friendlyError(err))
    } finally {
      setBusy(false)
    }
  }

  const iconPreviewUrl = useMemo(() => {
    if (iconPreview) return iconPreview
    if (keptIconPath) return getIconUrl(keptIconPath)
    return null
  }, [iconPreview, keptIconPath])

  const toggleBrowser = (slugValue: BrowserSupport) =>
    setBrowserSlugs((cur) =>
      cur.includes(slugValue) ? cur.filter((b) => b !== slugValue) : [...cur, slugValue],
    )

  return (
    <form onSubmit={onSubmitForm} noValidate className="space-y-5">
      {loadError && <AuthMessage kind="error">{loadError}</AuthMessage>}
      {formError && <AuthMessage kind="error">{formError}</AuthMessage>}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Extension name" id="ext-name" error={errors.name}>
          <input
            id="ext-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tab Tidier"
            className={cn(inputCls, inputErrCls(errors.name))}
          />
        </Field>
        <Field
          label="Slug (URL)"
          id="ext-slug"
          error={errors.slug || (slugState === 'taken' ? 'That slug is already taken.' : undefined)}
          hint={
            slugState === 'checking' ? (
              <span className="inline-flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> checking…
              </span>
            ) : slugState === 'available' ? (
              'Slug is available.'
            ) : (
              'extensions/{slug}. Lowercase letters, numbers, dashes.'
            )
          }
        >
          <input
            id="ext-slug"
            value={slug}
            onChange={(e) => {
              setSlugTouched(true)
              setSlug(e.target.value.toLowerCase())
            }}
            placeholder="tab-tidier"
            className={cn(inputCls, inputErrCls(errors.slug))}
          />
        </Field>
      </div>

      <Field label="Tagline" id="ext-tagline" error={errors.tagline} hint="One-line pitch (optional).">
        <input
          id="ext-tagline"
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          placeholder="What it does, in a breath."
          maxLength={140}
          className={cn(inputCls, inputErrCls(errors.tagline))}
        />
      </Field>

      <Field
        label="Description"
        id="ext-description"
        error={errors.description}
        hint="40–2000 characters. What it does, who it's for, why it's good."
      >
        <textarea
          id="ext-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          className={cn(inputCls, 'min-h-[120px]', inputErrCls(errors.description))}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Category" id="ext-category" error={errors.category}>
          <select
            id="ext-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={cn(inputCls, inputErrCls(errors.category))}
          >
            <option value="" disabled>
              Choose a category…
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Pricing" id="ext-pricing">
          <select
            id="ext-pricing"
            value={pricing}
            onChange={(e) => setPricing(e.target.value as Pricing)}
            className={inputCls}
          >
            <option value="free">Free</option>
            <option value="freemium">Freemium</option>
            <option value="paid">Paid</option>
          </select>
        </Field>
      </div>

      <Field label="Supported browsers" id="ext-browsers" error={errors.browsers}>
        <div className="flex flex-wrap gap-2" id="ext-browsers">
          {browsers.map((b) => {
            const on = browserSlugs.includes(b.slug)
            return (
              <button
                key={b.slug}
                type="button"
                aria-pressed={on}
                onClick={() => toggleBrowser(b.slug)}
                className={cn(
                  'focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border px-3.5 text-sm transition-colors',
                  on
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card hover:bg-muted',
                )}
              >
                <BrowserLogo browser={b.slug} className="h-4 w-4" />
                {b.label}
              </button>
            )
          })}
        </div>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Store URL"
          id="ext-store-url"
          error={errors.storeUrl}
          hint="Chrome Web Store / AMO / etc."
        >
          <input
            id="ext-store-url"
            value={storeUrl}
            onChange={(e) => setStoreUrl(e.target.value)}
            placeholder="https://chromewebstore.google.com/detail/…"
            inputMode="url"
            className={cn(inputCls, inputErrCls(errors.storeUrl))}
          />
        </Field>
        <Field label="Website URL (optional)" id="ext-website-url" error={errors.websiteUrl}>
          <input
            id="ext-website-url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://example.com"
            inputMode="url"
            className={cn(inputCls, inputErrCls(errors.websiteUrl))}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Icon (optional)"
          id="ext-icon"
          error={errors.icon}
          hint="PNG/JPEG/WebP/SVG, up to 2MB."
        >
          <div className="flex items-center gap-3">
            {iconPreviewUrl && (
              <img
                src={iconPreviewUrl}
                alt=""
                className="h-12 w-12 rounded-lg border border-border object-cover"
              />
            )}
            <input
              id="ext-icon"
              type="file"
              accept={ICON_TYPES.join(',')}
              onChange={(e) => pickImageFile(e, 'icon')}
              className="focus-ring min-h-[44px] w-full text-sm file:mr-3 file:min-h-[40px] file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-sm"
            />
          </div>
        </Field>
        {isAdmin && (
          <Field label="Install count (optional)" id="ext-downloads" error={errors.downloadCount}>
            <input
              id="ext-downloads"
              value={downloadCount}
              onChange={(e) => setDownloadCount(e.target.value)}
              inputMode="numeric"
              placeholder="0"
              className={cn(inputCls, inputErrCls(errors.downloadCount))}
            />
          </Field>
        )}
      </div>

      <Field
        label={`Screenshots (optional, ${MAX_SHOTS} max)`}
        id="ext-shots"
        error={errors.shot}
        hint="PNG/JPEG/WebP, up to 5MB each."
      >
        <div className="space-y-3">
          {(keptShots.length > 0 || shotPreviews.length > 0) && (
            <ul className="flex flex-wrap gap-3">
              {keptShots.map((s) => (
                <li key={s.path} className="relative">
                  <img src={s.url} alt="" className="h-20 w-28 rounded-lg border border-border object-cover" />
                  <button
                    type="button"
                    aria-label="Remove existing screenshot"
                    onClick={() => setKeptShots((cur) => cur.filter((x) => x.path !== s.path))}
                    className="focus-ring absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-xs"
                  >
                    ×
                  </button>
                </li>
              ))}
              {shotPreviews.map((url, i) => (
                <li key={url} className="relative">
                  <img src={url} alt="" className="h-20 w-28 rounded-lg border border-border object-cover" />
                  <button
                    type="button"
                    aria-label="Remove selected screenshot"
                    onClick={() => {
                      setShotFiles((cur) => cur.filter((_, idx) => idx !== i))
                      setShotPreviews((cur) => cur.filter((_, idx) => idx !== i))
                    }}
                    className="focus-ring absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-xs"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
          {totalShots < MAX_SHOTS && (
            <input
              id="ext-shots"
              type="file"
              accept={SHOT_TYPES.join(',')}
              onChange={(e) => pickImageFile(e, 'shot')}
              className="focus-ring min-h-[44px] w-full text-sm file:mr-3 file:min-h-[40px] file:rounded-md file:border-0 file:bg-muted file:px-3 file:text-sm"
            />
          )}
        </div>
      </Field>

      <Field
        label="Key features (optional)"
        id="ext-features"
        hint="One per line, up to 12."
      >
        <textarea
          id="ext-features"
          value={featuresText}
          onChange={(e) => setFeaturesText(e.target.value)}
          rows={4}
          placeholder={'Blocks trackers\nWorks offline\nOpen source'}
          className={cn(inputCls, 'min-h-[96px]')}
        />
      </Field>

      {isAdmin && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Status" id="ext-status">
            <select
              id="ext-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ExtensionStatus)}
              className={inputCls}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
              <option value="pending">Pending (queue)</option>
              <option value="rejected">Rejected</option>
            </select>
          </Field>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-1">
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel ?? (mode === 'submit' ? 'Submit for review' : editing ? 'Save changes' : 'Create extension')}
        </Button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={buttonStyles('ghost')}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
