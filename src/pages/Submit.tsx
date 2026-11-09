//
//   Public submission page.
//  
//   Signed-in users complete <ExtensionForm mode="submit">; RLS forces the new
//   row to status='pending', so nothing reaches the directory until an admin
//   approves it (see /admin). Signed-out visitors are routed through login with a round-trip back here.
//  

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Container } from '@/components/ui/Container'
import { Button, buttonStyles } from '@/components/ui/Button'
import { AuthCard, AuthMessage } from '@/components/auth/AuthCard'
import { ExtensionForm } from '@/components/extensions/ExtensionForm'
import type { ExtensionFormResult } from '@/components/extensions/ExtensionForm'
import { useAuth } from '@/context/AuthContext'
import { isSupabaseConfigured } from '@/lib/supabase'

import { usePageMeta } from '@/lib/seo'

export function Submit() {
  usePageMeta({
    title: 'Submit an extension',
    description:
      'Share your browser extension with the community. Submissions are reviewed before going live.',
  })
  const { isSignedIn, status } = useAuth()
  const navigate = useNavigate()
  const [done, setDone] = useState<ExtensionFormResult | null>(null)


  if (!isSupabaseConfigured) {
    return (
      <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
        <PageHeader
          eyebrow="Contribute"
          title="Submit an extension"
          description="Know a great extension? Add it to the directory."
        />
        <div className="w-full max-w-xl">
          <AuthMessage kind="error">
            Submitting is disabled in demo mode. It requires a connected Supabase project. You can
            still{' '}
            <Link to="/browse" className="font-medium underline">
              browse the directory
            </Link>
            .
          </AuthMessage>
        </div>
      </Container>
    )
  }

  if (status === 'loading') {
    return (
      <Container className="py-10 xs:py-14">
        <p className="text-sm text-muted-foreground">Checking your session…</p>
      </Container>
    )
  }

  if (!isSignedIn) {
    return (
      <AuthCard title="Sign in to submit" description="Submissions are tied to your account so you can track their review status.">
        <div className="space-y-3">
          <Button className="w-full" onClick={() => navigate('/login', { state: { from: '/submit' } })}>
            Sign in
          </Button>
          <button className={buttonStyles('outline', 'md', 'w-full')} onClick={() => navigate('/register', { state: { from: '/submit' } })}>
            Create an account
          </button>
          <p className="pt-1 text-xs text-muted-foreground">
            Approved extensions appear in the public directory. Yours stay unpublished until an
            admin reviews them.
          </p>
        </div>
      </AuthCard>
    )
  }

  if (done) {
    return (
      <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm xs:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600" />
              <div>
                <h1 className="text-xl font-bold tracking-tight">Submission received</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  “{done.slug}” is in the review queue. You can track its status, or withdraw it,
                  any time from your submissions page.
                </p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/submissions" className={buttonStyles('primary')}>
                View my submissions
              </Link>
              <button className={buttonStyles('ghost')} onClick={() => setDone(null)}>
                Submit another
              </button>
            </div>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container className="py-6 xs:py-8 sm:py-10 lg:py-14">
      <PageHeader
        eyebrow="Contribute"
        title="Submit an extension"
        description="Tell us about a great browser extension. It enters the review queue and goes live once an admin approves it. Until then only you can see it."
      />
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-4 shadow-sm xs:p-6">
        <ExtensionForm mode="submit" onSuccess={setDone} />
      </div>
    </Container>
  )
}
