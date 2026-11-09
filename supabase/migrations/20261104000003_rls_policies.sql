-- ===========================================================================
-- Migration 0003: Row Level Security
--
-- Model:
--   * Everyone (anon + authenticated) can READ published content and the
--     lookup/reference tables.
--   * Only an ADMIN (JWT app_metadata.role = 'admin') can create, change or
--     delete content.
--   * Any authenticated user may SUBMIT a new extension as 'pending'
--     (moderation queue) but never edit published rows or set their status.
--
-- This satisfies: "Public extension queries work" and
--                  "RLS prevents unauthorised modifications".
-- ===========================================================================

alter table public.authors            enable row level security;
alter table public.categories         enable row level security;
alter table public.browsers           enable row level security;
alter table public.tags               enable row level security;
alter table public.extensions         enable row level security;
alter table public.extension_browsers enable row level security;
alter table public.extension_tags     enable row level security;
alter table public.screenshots        enable row level security;

-- Re-apply the service_role bypass for migrations/seed (it owns the tables).
-- The postgres/service_role superuser-like role is exempt from RLS by default
-- in Supabase for DDL/seed operations.

-- ---------------------------------------------------------------------------
-- READ policies (public directory data)
-- ---------------------------------------------------------------------------
drop policy if exists "reference data is readable" on public.categories;
create policy "reference data is readable" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "browsers are readable" on public.browsers;
create policy "browsers are readable" on public.browsers
  for select to anon, authenticated using (true);

drop policy if exists "tags are readable" on public.tags;
create policy "tags are readable" on public.tags
  for select to anon, authenticated using (true);

drop policy if exists "authors are readable" on public.authors;
create policy "authors are readable" on public.authors
  for select to anon, authenticated using (true);

-- extensions: published rows are public; non-published rows only for admins.
drop policy if exists "extensions readable" on public.extensions;
create policy "extensions readable" on public.extensions
  for select to anon, authenticated
  using (status = 'published' or public.is_admin());

-- relation rows are readable (harmless without the parent extension row,
-- which is itself protected above).
drop policy if exists "extension_browsers readable" on public.extension_browsers;
create policy "extension_browsers readable" on public.extension_browsers
  for select to anon, authenticated using (true);

drop policy if exists "extension_tags readable" on public.extension_tags;
create policy "extension_tags readable" on public.extension_tags
  for select to anon, authenticated using (true);

drop policy if exists "screenshots readable" on public.screenshots;
create policy "screenshots readable" on public.screenshots
  for select to anon, authenticated using (true);

-- ---------------------------------------------------------------------------
-- WRITE policies
-- ---------------------------------------------------------------------------
-- Admin full control on the extension entity + relations.
drop policy if exists "admin manages extensions" on public.extensions;
create policy "admin manages extensions" on public.extensions
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages extension_browsers" on public.extension_browsers;
create policy "admin manages extension_browsers" on public.extension_browsers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages extension_tags" on public.extension_tags;
create policy "admin manages extension_tags" on public.extension_tags
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages screenshots" on public.screenshots;
create policy "admin manages screenshots" on public.screenshots
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages categories" on public.categories;
create policy "admin manages categories" on public.categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages browsers" on public.browsers;
create policy "admin manages browsers" on public.browsers
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages tags" on public.tags;
create policy "admin manages tags" on public.tags
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admin manages authors" on public.authors;
create policy "admin manages authors" on public.authors
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- Public submission: an authenticated user may INSERT a new extension, but it
-- is FORCED to 'pending' and cannot be marked featured. Updates/deletes are
-- still admin-only (there is intentionally no non-admin update policy).
drop policy if exists "authenticated can submit pending extension" on public.extensions;
create policy "authenticated can submit pending extension" on public.extensions
  for insert to authenticated
  with check (status = 'pending' and is_featured = false);
