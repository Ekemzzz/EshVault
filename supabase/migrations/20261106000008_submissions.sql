-- ===========================================================================
-- Migration 0008: Submissions + admin support (Phase 8)
--
-- Model: a submission IS an extensions row forced to status='pending'
-- (the 0003 insert policy already exists; here we bind it to the submitter,
-- give submitters read/withdraw rights on their own rows, and let them
-- attach browsers/screenshots to their pending row only).
--
--  * 'rejected' enum value + submitted_by / rejection_reason / reviewed_at
--  * owns_pending_extension() security-definer helper (no RLS recursion)
--  * extensions: own-submission read + withdraw-delete policies
--  * extension_browsers / screenshots: owner-write on pending rows
--  * storage: authenticated users may write inside their own "{uid}/" folder
--
-- Apply by pasting into the Supabase SQL editor (same workflow as before).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Schema: new status value + submission metadata columns
-- ---------------------------------------------------------------------------
-- PG12+ allows ADD VALUE inside a transaction as long as the new literal is
-- not consumed by later statements in the same transaction (it isn't here).
alter type public.extension_status add value if not exists 'rejected';

alter table public.extensions
  add column if not exists submitted_by     uuid references auth.users(id) on delete set null,
  add column if not exists rejection_reason text,
  add column if not exists reviewed_at      timestamptz;

create index if not exists extensions_submitted_by_idx on public.extensions (submitted_by);
create index if not exists extensions_pending_idx      on public.extensions (created_at) where status = 'pending';

-- ---------------------------------------------------------------------------
-- 2. Helper: does the current user own `ext_id` AND is it still pending?
--    SECURITY DEFINER so policies on relation tables can consult extensions
--    without tripping that table's own RLS.
-- ---------------------------------------------------------------------------
create or replace function public.owns_pending_extension(ext_id uuid)
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.extensions e
    where e.id = ext_id
      and e.submitted_by = (select auth.uid())
      and e.status = 'pending'
  );
$$;

grant execute on function public.owns_pending_extension(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 3. extensions policies
-- ---------------------------------------------------------------------------
-- Submission insert now additionally requires submitted_by = the caller
-- (0003 introduced the policy; we replace it with the bound version).
drop policy if exists "authenticated can submit pending extension" on public.extensions;
create policy "authenticated can submit pending extension" on public.extensions
  for insert to authenticated
  with check (
    status = 'pending'
    and is_featured = false
    and submitted_by = auth.uid()
  );

-- Submitters can read their own rows (pending / rejected / published alike).
-- Public read of published rows is already covered by "extensions readable".
drop policy if exists "submitters can read their own submissions" on public.extensions;
create policy "submitters can read their own submissions" on public.extensions
  for select to authenticated
  using (auth.uid() = submitted_by);

-- Withdraw = hard-delete own row while it is still pending. There is
-- intentionally no non-admin UPDATE policy: submitters can never flip status.
drop policy if exists "submitters can withdraw pending submissions" on public.extensions;
create policy "submitters can withdraw pending submissions" on public.extensions
  for delete to authenticated
  using (auth.uid() = submitted_by and status = 'pending');

-- ---------------------------------------------------------------------------
-- 4. Relation writes for submitters (scoped to their own pending rows only)
-- ---------------------------------------------------------------------------
drop policy if exists "submitters manage browsers on own pending" on public.extension_browsers;
create policy "submitters manage browsers on own pending" on public.extension_browsers
  for all to authenticated
  using (public.owns_pending_extension(extension_id))
  with check (public.owns_pending_extension(extension_id));

drop policy if exists "submitters manage screenshots on own pending" on public.screenshots;
create policy "submitters manage screenshots on own pending" on public.screenshots
  for all to authenticated
  using (public.owns_pending_extension(extension_id))
  with check (public.owns_pending_extension(extension_id));

-- ---------------------------------------------------------------------------
-- 5. Storage: submitters may upload inside their own "{uid}/" folder.
--    Bucket-level file_size_limit + allowed_mime_types (0004) still enforce
--    type/size for everyone. Admin policies on icons//screenshots/ are
--    untouched, so admins keep full control of curated paths.
-- ---------------------------------------------------------------------------
drop policy if exists "submitters upload own assets" on storage.objects;
create policy "submitters upload own assets" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "submitters replace own assets" on storage.objects;
create policy "submitters replace own assets" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "submitters delete own assets" on storage.objects;
create policy "submitters delete own assets" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and (storage.foldername(name))[1] = auth.uid()::text
  );
