//
//   Admin dashboard.amin, admin JWT only (AdminRoute + RLS).
//  
//   Four tabs: submission approvals, extension CRUD (incl. featured toggles),
//   category management and review moderation. The pending count badge keeps
//   the Submissions tab honest after actions without a full page reload.
//  
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, ListChecks, MessageSquareText, Tags, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Container } from '@/components/ui/Container'
import { buttonStyles } from '@/components/ui/Button'
import { AuthMessage } from '@/components/auth/AuthCard'
import { isSupabaseConfigured } from '@/lib/supabase'
import { countPendingSubmissions } from '@/services/admin.service'
import { SubmissionsTab } from '@/components/admin/SubmissionsTab'
import { ExtensionsTab } from '@/components/admin/ExtensionsTab'
import { CategoriesTab } from '@/components/admin/CategoriesTab'
import { ReviewsTab } from '@/components/admin/ReviewsTab'
import { cn } from '@/utils/cn'

type Tab = 'submissions' | 'extensions' | 'categories' | 'reviews'

const TABS: Array<{ id: Tab; label: string; icon: typeof Upload }> = [
  { id: 'submissions', label: 'Submissions', icon: Upload },
  { id: 'extensions', label: 'Extensions', icon: ListChecks },
  { id: 'categories', label: 'Categories', icon: Tags },
  { id: 'reviews', label: 'Reviews', icon: MessageSquareText },
]

import { usePageMeta } from '@/lib/seo'

export function Admin() {
  usePageMeta({ title: 'Admin dashboard', noindex: true })
  const [tab, setTab] = useState<Tab>('submissions')
  const [pendingCount, setPendingCount] = useState<number | null>(null)

  const refreshPending = useCallback(() => {
    if (!isSupabaseConfigured) return
    countPendingSubmissions()
      .then(setPendingCount)
      .catch(() => setPendingCount(null))
  }, [])

  useEffect(refreshPending, [refreshPending])

  if (!isSupabaseConfigured) {
    return (
      <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
        <PageHeader eyebrow="Admin" title="Admin dashboard" />
        <div className="max-w-xl">
          <AuthMessage kind="error">
            The admin dashboard requires a connected Supabase project. It is inactive in demo mode.
          </AuthMessage>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader
        eyebrow="Admin"
        title="Admin dashboard"
        description="Approve submissions, manage extensions and categories, and moderate reviews."
      />

      <div role="tablist" aria-label="Admin sections" className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              'focus-ring inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors',
              tab === id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === 'submissions' && pendingCount != null && pendingCount > 0 && (
              <span className="ml-0.5 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-500 px-1.5 text-[11px] font-bold text-white">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
        <Link
          to="/browse"
          className={cn(buttonStyles('ghost', 'sm'), 'ml-auto')}
        >
          <CheckSquare className="mr-2 h-4 w-4" /> View public site
        </Link>
      </div>

      {tab === 'submissions' && <SubmissionsTab onQueueChanged={refreshPending} />}
      {tab === 'extensions' && <ExtensionsTab />}
      {tab === 'categories' && <CategoriesTab />}
      {tab === 'reviews' && <ReviewsTab />}
    </Container>
  )
}
