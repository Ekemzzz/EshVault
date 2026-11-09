// CompareToggle: selection control.
//  * Chip button flipping between "Compare" and "In compare". Disabled with a hint once the three-slot tray is full (removals always stay possible).
 
import { Check, Scale } from 'lucide-react'
import { useCompare, MAX_COMPARE } from '@/hooks/useCompare'
import { cn } from '@/utils/cn'

interface CompareToggleProps {
  slug: string
  // Display name for the tray + accessible labels (defaults to the slug).
  name?: string
  iconUrl?: string
  //  Icon-only circular variant for tight spots (alternatives chips). 
  mini?: boolean
  className?: string
}

export function CompareToggle({ slug, name, iconUrl, mini, className }: CompareToggleProps) {
  const { isSelected, atCap, toggle } = useCompare()
  const selected = isSelected(slug)
  const disabled = !selected && atCap
  const label = name ?? slug

  const onToggle = () => toggle({ slug, name: label, iconUrl })

  const title = disabled
    ? `You can compare up to ${MAX_COMPARE} extensions at once. Remove one first`
    : selected
      ? 'Remove from comparison'
      : 'Add to comparison'

  if (mini) {
    return (
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-pressed={selected}
        aria-label={
          selected ? `Remove ${label} from comparison` : `Add ${label} to comparison`
        }
        title={title}
        className={cn(
          'focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-colors',
          selected
            ? 'border-primary bg-primary/10 text-primary'
            : 'border-border text-muted-foreground hover:text-foreground',
          disabled && 'cursor-not-allowed opacity-50',
          className,
        )}
      >
        {selected ? <Check className="h-4 w-4" /> : <Scale className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      title={title}
      className={cn(
        'focus-ring inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border text-muted-foreground hover:text-foreground',
        disabled && 'cursor-not-allowed opacity-50',
        className,
      )}
    >
      {selected ? <Check className="h-3.5 w-3.5" /> : <Scale className="h-3.5 w-3.5" />}
      {selected ? 'In compare' : 'Compare'}
    </button>
  )
}
