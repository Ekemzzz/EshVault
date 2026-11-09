import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'accent'

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border-transparent',
  secondary: 'bg-secondary text-secondary-foreground border-transparent',
  outline: 'border border-border text-foreground',
  accent: 'bg-accent text-accent-foreground border-transparent',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  children: ReactNode
}

export function Badge({ className, variant = 'default', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
