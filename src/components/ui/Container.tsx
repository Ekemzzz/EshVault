import { forwardRef, type ElementType, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ContainerProps = {
  as?: ElementType
  fluid?: boolean
  className?: string
  children: ReactNode
}

// 
//   Responsive page container. Uses the Tailwind `container` config
//   (centered, capped at 1400px) and adds the fluid side padding here: the
//   config only declares a single `2xl` screen, so `container.padding` cannot produce breakpoint steps on its own.
//  
const containerPadding = 'px-[0.875rem] xs:px-4 sm:px-6 lg:px-8'

export const Container = forwardRef<HTMLElement, ContainerProps>(
  ({ as: Tag = 'div', fluid = false, className, children }, ref) => (
    <Tag
      ref={ref as never}
      className={cn(fluid ? 'w-full' : 'container', containerPadding, className)}
    >
      {children}
    </Tag>
  ),
)

Container.displayName = 'Container'
