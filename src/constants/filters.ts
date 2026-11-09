import type { Pricing } from '@/types'
import type { SortKey } from '@/services/extensions.service'

export interface LabeledOption<T extends string | number> {
  value: T
  label: string
  hint?: string
}

export const pricingOptions: LabeledOption<Pricing>[] = [
  { value: 'free', label: 'Free' },
  { value: 'freemium', label: 'Freemium' },
  { value: 'paid', label: 'Paid' },
]

export const sortOptions: LabeledOption<SortKey>[] = [
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Most downloaded' },
  { value: 'newest', label: 'Newest' },
  { value: 'name_asc', label: 'Name (A → Z)' },
]

export const pricingLabel = (v?: Pricing): string | undefined =>
  v ? pricingOptions.find((o) => o.value === v)?.label : undefined
