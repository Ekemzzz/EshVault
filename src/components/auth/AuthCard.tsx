
//  Mirrors the card + field styling established by the Submit page preview.
 
import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { Container } from '@/components/ui/Container'
import { cn } from '@/utils/cn'

interface AuthCardProps {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <Container className="py-10 xs:py-14 sm:py-16">
      <div className="mx-auto w-full max-w-md">
        <Link
          to="/"
          className="focus-ring inline-flex min-h-[44px] items-center gap-1.5 rounded-md text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to directory
        </Link>
        <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-sm xs:p-6">
          <h1 className="text-2xl font-bold tracking-tight xs:text-3xl">{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-4 text-sm">{footer}</div>}
        </div>
      </div>
    </Container>
  )
}

interface AuthFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  hint?: string
}

export function AuthField({ label, id, hint, className, ...inputProps }: AuthFieldProps) {
  // Password inputs get a visibility toggle; every other input renders unchanged.
  const isPassword = inputProps.type === 'password'
  const [visible, setVisible] = useState(false)
  const resolvedType = isPassword && visible ? 'text' : inputProps.type

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          id={id}
          className={cn(
            'focus-ring min-h-[44px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
            'placeholder:text-muted-foreground/60',
            isPassword && 'pr-11',
            className,
          )}
          {...inputProps}
          type={resolvedType}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className={cn(
              'focus-ring absolute right-0 top-1/2 -translate-y-1/2',
              'inline-flex h-11 w-11 items-center justify-center rounded-md',
              'text-muted-foreground transition-colors hover:text-foreground',
            )}
          >
            {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

/** Inline success / error banner used at the top of auth forms. */
export function AuthMessage({ kind, children }: { kind: 'error' | 'success'; children: ReactNode }) {
  return (
    <div
      role={kind === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md border px-3 py-2.5 text-sm',
        kind === 'error'
          ? 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300'
          : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
      )}
    >
      {children}
    </div>
  )
}

// Controlled textarea matching AuthField styling (review form, profile bio).
export function AuthTextArea({
  label,
  id,
  className,
  ...props
}: {
  label: string
  id: string
  className?: string
} & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>
      <textarea
        id={id}
        className={cn(
          'focus-ring mt-1 min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm',
          'placeholder:text-muted-foreground/60',
          className,
        )}
        {...props}
      />
    </div>
  )
}
