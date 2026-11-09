// Typed error thrown by the database/storage services.
export class DatabaseError extends Error {
  readonly code?: string
  readonly details?: string
  readonly hint?: string
  readonly cause?: unknown

  constructor(
    message: string,
    info?: { code?: string; details?: string; hint?: string; cause?: unknown },
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.code = info?.code
    this.details = info?.details
    this.hint = info?.hint
    if (info?.cause) this.cause = info.cause
  }
}

export function unwrap<T>(res: { data: T | null; error: unknown }): T {
  if (res.error) {
    const e = res.error as { message?: string; code?: string; details?: string; hint?: string }
    throw new DatabaseError(e.message ?? 'Database request failed', {
      code: e.code,
      details: e.details,
      hint: e.hint,
      cause: res.error,
    })
  }
  return res.data as T
}
