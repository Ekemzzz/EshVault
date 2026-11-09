import { supabase } from '@/lib/supabase'
import { unwrap } from './errors'

//Storage buckets created in migration 0004.
export const ICON_BUCKET = 'extension-icons'
export const SCREENSHOT_BUCKET = 'extension-screenshots'

// Resolve a public URL for a stored object path (public-read buckets).
export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

export const getIconUrl = (path: string) => getPublicUrl(ICON_BUCKET, path)
export const getScreenshotUrl = (path: string) => getPublicUrl(SCREENSHOT_BUCKET, path)

function sanitise(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

//
// Upload an extension icon. Requires an admin JWT (see storage RLS).
// Returns the stored object path (store it in extensions.icon_path).
// 
export async function uploadIcon(file: File, slug: string): Promise<string> {
  const ext = (file.type.split('/')[1] ?? 'png').replace('svg+xml', 'svg')
  const path = `icons/${sanitise(slug)}.${ext}`
  unwrap(
    await supabase.storage
      .from(ICON_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true }),
  )
  return path
}

export async function uploadScreenshot(file: File, slug: string, position = 0): Promise<string> {
  const ext = (file.type.split('/')[1] ?? 'png').replace('svg+xml', 'svg')
  const path = `screenshots/${sanitise(slug)}/${position}-${Date.now()}.${ext}`
  unwrap(
    await supabase.storage
      .from(SCREENSHOT_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: true }),
  )
  return path
}

// Delete a stored object (admin).
export async function deleteObject(bucket: string, paths: string[]): Promise<void> {
  unwrap(await supabase.storage.from(bucket).remove(paths))
}

/* --------------------------- submitter uploads ---------------------------- */

function extensionOf(file: File): string {
  return (file.type.split('/')[1] ?? 'png').replace('svg+xml', 'svg')
}

//
//  Upload an icon for a submission. Stored under the submitter's own folder
//   ({uid}/…), the storage policy added in migration 0008 lets authenticated
//   users write ONLY inside that prefix; bucket limits (2MB, image MIME) areenforced server-side regardless.
//  */
export async function uploadSubmissionIcon(file: File, uid: string): Promise<string> {
  const path = `${uid}/icon-${Date.now()}.${extensionOf(file)}`
  unwrap(
    await supabase.storage.from(ICON_BUCKET).upload(path, file, { contentType: file.type }),
  )
  return path
}

// Upload a submission screenshot under the submitter's own folder.
export async function uploadSubmissionScreenshot(
  file: File,
  uid: string,
  position = 0,
): Promise<string> {
  const path = `${uid}/shot-${position}-${Date.now()}.${extensionOf(file)}`
  unwrap(
    await supabase.storage.from(SCREENSHOT_BUCKET).upload(path, file, { contentType: file.type }),
  )
  return path
}
