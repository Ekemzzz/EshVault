import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  placeholder?: string
  size?: 'md' | 'lg'
  suggestions?: Array<{ label: string; to?: string }>
  className?: string
}

// 
//   Controlled search field that routes to /browse?q=... on submit.
//   Query execution lives in the services layer (full-text RPC with a lenient substring fallback).
//  
export function SearchBar({
  placeholder = 'Search extensions…',
  size = 'md',
  suggestions,
  className,
}: SearchBarProps) {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const query = value.trim()
    navigate(query ? `/browse?q=${encodeURIComponent(query)}` : '/browse')
  }

  return (
    <div className={cn('w-full', className)}>
      <form
        onSubmit={handleSubmit}
        role="search"
        className={cn(
          'flex items-center gap-2 rounded-xl border border-input bg-card px-3 shadow-sm',
          'transition-shadow focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40',
          size === 'lg' ? 'h-14' : 'h-11',
        )}
      >
        <Search className={cn('shrink-0 text-muted-foreground', size === 'lg' ? 'h-5 w-5' : 'h-4 w-4')} />
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={cn(
            // min-w-0 lets the field shrink instead of pushing the submit
            // button out of the row on narrow phones.
            'h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground',
            size === 'lg' && 'text-base',
          )}
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            'btn-base shrink-0 bg-primary text-primary-foreground hover:bg-primary/90',
            size === 'lg' ? 'h-10 px-3 text-sm xs:px-5' : 'h-8 px-2.5 text-sm xs:px-4',
          )}
        >
          <Search className={cn(size === 'lg' ? 'h-5 w-5 xs:hidden' : 'h-4 w-4 xs:hidden')} />
          <span className="hidden xs:inline">Search</span>
        </button>
      </form>

      {suggestions && suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Try:</span>
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() =>
                navigate(
                  suggestion.to ??
                    `/browse?q=${encodeURIComponent(suggestion.label)}`,
                )
              }
              className="focus-ring rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
