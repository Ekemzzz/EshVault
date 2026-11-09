-- ===========================================================================
-- Migration 0004: Storage buckets + policies
--
-- Buckets (both public-read for serving assets to the directory UI):
--   * extension-icons: square app tiles
--   * extension-screenshots: promotional screenshots
--
-- Reads are public; all writes require an admin JWT. This satisfies
-- "Storage policies work" while ensuring the anon key can never mutate or
-- delete stored assets.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Buckets
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('extension-icons',       'extension-icons',       true,  2097152, array['image/png','image/jpeg','image/webp','image/svg+xml']),
  ('extension-screenshots', 'extension-screenshots', true,  5242880, array['image/png','image/jpeg','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------------
-- Policies on storage.objects
-- ---------------------------------------------------------------------------
-- Public read (anon + authenticated).
drop policy if exists "extension assets are publicly readable" on storage.objects;
create policy "extension assets are publicly readable"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id in ('extension-icons', 'extension-screenshots'));

-- Admin upload.
drop policy if exists "admin uploads extension assets" on storage.objects;
create policy "admin uploads extension assets"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and public.is_admin()
  );

-- Admin update/replace.
drop policy if exists "admin updates extension assets" on storage.objects;
create policy "admin updates extension assets"
  on storage.objects for update
  to authenticated
  using (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and public.is_admin()
  )
  with check (public.is_admin());

-- Admin delete.
drop policy if exists "admin deletes extension assets" on storage.objects;
create policy "admin deletes extension assets"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id in ('extension-icons', 'extension-screenshots')
    and public.is_admin()
  );
