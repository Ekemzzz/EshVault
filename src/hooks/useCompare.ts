// 
//   Compare tray state..
//  
//   Deliberately client-side only: comparison is not bound to an account, so it
//   works for unauthenticated users and survives reloads via localStorage. The
//   store is module-level (external store pattern) so every consumer (grid
//   toggles, the floating bar, the compare page) stays in sync without context.
//  
import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'ext-compare-slugs'
export const MAX_COMPARE = 3

// Minimal display metadata so the tray can render without refetching.
export interface CompareEntry {
  slug: string
  name: string
  iconUrl?: string
}

let entries: CompareEntry[] = hydrate()
const listeners = new Set<() => void>()

function hydrate(): CompareEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(
        (e): e is CompareEntry =>
          !!e && typeof e === 'object' && typeof (e as CompareEntry).slug === 'string',
      )
      .map((e) => ({ slug: e.slug, name: typeof e.name === 'string' ? e.name : e.slug, iconUrl: e.iconUrl }))
      .slice(0, MAX_COMPARE)
  } catch {
    return []
  }
}

function persist(): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch {
    // Storage unavailable (private mode / quota): tray still works in-tab.
  }
}

function set(next: CompareEntry[]): void {
  entries = next.slice(0, MAX_COMPARE)
  persist()
  listeners.forEach((l) => l())
}

if (typeof window !== 'undefined') {
  // Same-origin tabs share the tray; mirror changes made elsewhere.
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      entries = hydrate()
      listeners.forEach((l) => l())
    }
  })
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot(): CompareEntry[] {
  return entries
}

export interface UseCompareResult {
  entries: CompareEntry[]
  slugs: string[]
  count: number
  isSelected: (slug: string) => boolean
  /** True when the tray is full and new selections would be rejected. */
  atCap: boolean
  /** Returns false when the add was rejected by the cap. */
  toggle: (entry: CompareEntry) => boolean
  remove: (slug: string) => void
  clear: () => void
}

export function useCompare(): UseCompareResult {
  const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  // Mutations read the module-level `entries` (never a stale closure value),
  // so empty dependency arrays are intentional.
  const toggle = useCallback((entry: CompareEntry): boolean => {
    if (entries.some((e) => e.slug === entry.slug)) {
      set(entries.filter((e) => e.slug !== entry.slug))
      return true
    }
    if (entries.length >= MAX_COMPARE) return false
    set([...entries, entry])
    return true
  }, [])

  const remove = useCallback((slug: string) => {
    set(entries.filter((e) => e.slug !== slug))
  }, [])

  const clear = useCallback(() => {
    set([])
  }, [])

  return {
    entries: current,
    slugs: current.map((e) => e.slug),
    count: current.length,
    isSelected: (slug) => current.some((e) => e.slug === slug),
    atCap: current.length >= MAX_COMPARE,
    toggle,
    remove,
    clear,
  }
}
