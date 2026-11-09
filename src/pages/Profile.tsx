import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Container } from '@/components/ui/Container'
import { PageHeader } from '@/components/common/PageHeader'
import { AuthField, AuthMessage, AuthTextArea } from '@/components/auth/AuthCard'
import { Button } from '@/components/ui/Button'
import { ExtensionIcon } from '@/components/extension/ExtensionIcon'
import { useAuth } from '@/hooks/useAuth'
import * as auth from '@/services/auth.service'

const MIN_PASSWORD = 8

import { usePageMeta } from '@/lib/seo'

export function Profile() {
  usePageMeta({ title: 'Your profile', noindex: true })
  const { user, profile, refresh } = useAuth()

  const [displayName, setDisplayName] = useState(profile?.displayName ?? user?.displayName ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatarUrl ?? '')
  const [saving, setSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [pwSaving, setPwSaving] = useState(false)
  const [pwMsg, setPwMsg] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayName.trim()) {
      setProfileMsg({ kind: 'error', text: 'Display name cannot be empty.' })
      return
    }
    setSaving(true)
    setProfileMsg(null)
    auth
      .updateMyProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        avatarUrl: avatarUrl.trim() || null,
      })
      .then(async () => {
        await refresh()
        setProfileMsg({ kind: 'success', text: 'Profile saved.' })
      })
      .catch((err: unknown) =>
        setProfileMsg({
          kind: 'error',
          text: err instanceof Error ? err.message : 'Could not save your profile.',
        }),
      )
      .finally(() => setSaving(false))
  }

  const savePassword = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < MIN_PASSWORD) {
      setPwMsg({ kind: 'error', text: `Password must be at least ${MIN_PASSWORD} characters.` })
      return
    }
    if (password !== confirm) {
      setPwMsg({ kind: 'error', text: 'The two passwords do not match.' })
      return
    }
    setPwSaving(true)
    setPwMsg(null)
    auth
      .updatePassword(password)
      .then(() => {
        setPassword('')
        setConfirm('')
        setPwMsg({ kind: 'success', text: 'Password updated.' })
      })
      .catch((err: unknown) =>
        setPwMsg({
          kind: 'error',
          text: err instanceof Error ? err.message : 'Could not update your password.',
        }),
      )
      .finally(() => setPwSaving(false))
  }

  return (
    <>
      <Container className="pt-6 xs:pt-8">
        <PageHeader
          eyebrow="Account"
          title="Your profile"
          description="How you appear on the reviews you write. Only you (and moderators) can edit this."
        />
      </Container>

      <Container className="pb-10 xs:pb-14">
        <div className="grid grid-cols-1 gap-4 xs:gap-5 lg:grid-cols-2">
          {/* Identity + profile edit */}
          <section className="rounded-2xl border border-border bg-card p-5 xs:p-6">
            <div className="flex items-center gap-4">
              <ExtensionIcon
                name={displayName || user?.displayName || 'You'}
                slug={user?.id ?? 'me'}
                iconUrl={avatarUrl || undefined}
                className="h-14 w-14"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold">{displayName || user?.displayName}</p>
                <p className="truncate text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <form onSubmit={saveProfile} className="mt-6 space-y-4" noValidate>
              {profileMsg && <AuthMessage kind={profileMsg.kind}>{profileMsg.text}</AuthMessage>}
              <AuthField
                label="Display name"
                id="profile-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
              />
              <AuthField
                label="Avatar URL (optional)"
                id="profile-avatar"
                type="url"
                inputMode="url"
                placeholder="https://…"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
              />
              <AuthTextArea
                label="Short bio (optional)"
                id="profile-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={280}
                placeholder="A sentence about the kind of extensions you try."
              />
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save profile'}
              </Button>
            </form>
          </section>

          {/* Security */}
          <div className="space-y-4 xs:space-y-5">
            <section className="rounded-2xl border border-border bg-card p-5 xs:p-6">
              <h2 className="text-lg font-semibold">Change password</h2>
              <form onSubmit={savePassword} className="mt-4 space-y-4" noValidate>
                {pwMsg && <AuthMessage kind={pwMsg.kind}>{pwMsg.text}</AuthMessage>}
                <AuthField
                  label="New password"
                  id="profile-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={MIN_PASSWORD}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <AuthField
                  label="Confirm new password"
                  id="profile-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <Button type="submit" variant="outline" disabled={pwSaving}>
                  {pwSaving ? 'Updating…' : 'Update password'}
                </Button>
              </form>
            </section>

            <section className="rounded-2xl border border-border bg-card p-5 xs:p-6">
              <h2 className="text-lg font-semibold">Your data</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Saved extensions and your reviews live in{' '}
                <Link to="/dashboard" className="font-medium text-primary hover:underline">
                  your dashboard
                </Link>
                . Deleting your account is handled by the site moderators on request.
              </p>
            </section>
          </div>
        </div>
      </Container>
    </>
  )
}
