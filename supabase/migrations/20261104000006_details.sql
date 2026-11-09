-- =============================================================
-- Migration 06: Extension detail data (Phase 5)
-- Adds:
--   • extensions.features       (jsonb array of {title, description})
--   • extensions.permissions    (jsonb array of {label, description})
--   • extension_browsers.install_url  (per-browser install link)
--   • reviews                   (publicly readable, admin-managed)
-- Then recreates the published_extensions view (now also exposing
-- features, permissions and an aggregated install_links jsonb array).
-- =============================================================

-- ---- Extensions: features + permissions as jsonb arrays -------------------
alter table public.extensions
  add column if not exists features     jsonb not null default '[]'::jsonb,
  add column if not exists permissions  jsonb not null default '[]'::jsonb;

comment on column public.extensions.features is
  'JSON array of {title, description?} objects describing key capabilities.';
comment on column public.extensions.permissions is
  'JSON array of {label, description?} objects declaring requested browser permissions.';

-- ---- Per-browser install link ---------------------------------------------
alter table public.extension_browsers
  add column if not exists install_url text;

comment on column public.extension_browsers.install_url is
  'Direct install URL for this browser (web store / addons marketplace).';

-- ---- Reviews ---------------------------------------------------------------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  extension_id  uuid not null references public.extensions(id) on delete cascade,
  author_name   text not null check (length(trim(author_name)) between 1 and 80),
  rating        int  not null check (rating between 1 and 5),
  title         text check (title is null or length(trim(title)) <= 120),
  body          text not null check (length(trim(body)) between 1 and 2000),
  created_at    timestamptz not null default now()
);

create index if not exists reviews_extension_created_idx
  on public.reviews (extension_id, created_at desc);
create index if not exists reviews_rating_idx
  on public.reviews (rating);

alter table public.reviews enable row level security;

-- Public read for anyone. Writes are admin-only (below).
create policy reviews_public_read on public.reviews
  for select to anon, authenticated using (true);

create policy reviews_admin_all on public.reviews
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- Recreate the published view (columns changed) ------------------------
-- Drop function before view: `search_extensions` returns `setof published_extensions`
-- and Postgres blocks dropping the view while that dependency exists.
drop function if exists public.search_extensions(text);
drop view if exists public.published_extensions;

create view public.published_extensions
with (security_invoker = on)
as
select
  e.id,
  e.slug,
  e.name,
  e.tagline,
  e.description,
  e.icon_path,
  e.website_url,
  e.store_url,
  e.download_count,
  e.rating,
  e.pricing,
  e.is_featured,
  e.created_at,
  e.updated_at,
  e.features,
  e.permissions,
  c.slug as category_slug,
  a.name as author_name,
  a.website as author_website,
  coalesce(b.browser_slugs, '{}'::text[]) as browser_slugs,
  coalesce(il.install_links, '[]'::jsonb) as install_links,
  coalesce(t.tag_slugs,       '{}'::text[]) as tag_slugs,
  coalesce(s.screenshot_paths,'{}'::text[]) as screenshot_paths
from public.extensions e
join public.categories c on c.id = e.category_id
left join public.authors a on a.id = e.author_id
left join lateral (
  select array_agg(br.slug)::text[] as browser_slugs
  from public.extension_browsers eb
  join public.browsers br on br.id = eb.browser_id
  where eb.extension_id = e.id
) b on true
left join lateral (
  select json_agg(
           json_build_object(
             'browser', br.slug,
             'url',     eb.install_url
           )
         )::jsonb as install_links
  from public.extension_browsers eb
  join public.browsers br on br.id = eb.browser_id
  where eb.extension_id = e.id
    and eb.install_url is not null
) il on true
left join lateral (
  select array_agg(tg.slug)::text[] as tag_slugs
  from public.extension_tags et
  join public.tags tg on tg.id = et.tag_id
  where et.extension_id = e.id
) t on true
left join lateral (
  select array_agg(sc.storage_path order by sc.position)::text[] as screenshot_paths
  from public.screenshots sc
  where sc.extension_id = e.id
) s on true
where e.status = 'published';

grant select on public.published_extensions to anon, authenticated;

-- ---- Recreate the search function (return type is bound to the view) ------
create or replace function public.search_extensions(p_query text)
returns setof public.published_extensions
language sql
stable
security invoker
set search_path = public
as $$
  select p.*
  from public.published_extensions p
  where
    p_query is null
    or trim(p_query) = ''
    or to_tsvector(
         'simple',
         coalesce(p.name, '')    || ' ' ||
         coalesce(p.tagline, '') || ' ' ||
         coalesce(p.description, '')
       ) @@ websearch_to_tsquery('simple', p_query)
  order by
    case
      when p_query is null or trim(p_query) = '' then 0
      else ts_rank(
        to_tsvector(
          'simple',
          coalesce(p.name, '')    || ' ' ||
          coalesce(p.tagline, '') || ' ' ||
          coalesce(p.description, '')
        ),
        websearch_to_tsquery('simple', p_query)
      )
    end desc,
    p.download_count desc nulls last
$$;
