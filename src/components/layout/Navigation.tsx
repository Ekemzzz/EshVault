import { NavLink } from 'react-router-dom'
import { cn } from '@/utils/cn'
import { headerNavigation } from '@/constants/navigation'

// 
//   Desktop horizontal navigation. Active links get the accent treatment.
//  
export function Navigation({ className }: { className?: string }) {
  return (
    <nav className={cn('hidden items-center gap-1 md:flex', className)} aria-label="Primary">
      {headerNavigation.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) =>
            cn(
              'focus-ring rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent/60',
            )
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}
