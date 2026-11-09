-- =============================================================
-- Migration 05: Extension pricing model (added in Phase 4)
-- Adds a `pricing` column to extensions, indexes it, and
-- recreates the published_extensions view + search function so
-- pricing is available to public queries and filters.
-- =============================================================

-- Add pricing column with a small allowed set of values.
alter table public.extensions
  add column if not exists pricing text not null default 'free'
    constraint extensions_pricing_check
    check (pricing in ('free', 'freemium', 'paid'));

create index if not exists extensions_pricing_idx
  on public.extensions (pricing);

comment on column public.extensions.pricing is
  'free = no cost, freemium = base free + paid tier, paid = requires purchase.';

-- Recreate the flattened public view (drops first because the column list changes).
-- Order matters: `search_extensions` is declared `returns setof published_extensions`,
-- which is a hard type dependency in Postgres. The view cannot be dropped while that
-- function exists, so drop the function first, then the view, then rebuild both.
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
  c.slug as category_slug,
  a.name as author_name,
  a.website as author_website,
  coalesce(b.browser_slugs, '{}'::text[]) as browser_slugs,
  coalesce(t.tag_slugs,   '{}'::text[]) as tag_slugs,
  coalesce(s.screenshot_paths, '{}'::text[]) as screenshot_paths
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

comment on view public.published_extensions is
  'Flattened, publicly readable view of published extensions, including pricing.';

grant select on public.published_extensions to anon, authenticated;

-- Recreate the search function (returns setof published_extensions, so shape changed).
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
         coalesce(p.name, '') || ' ' ||
         coalesce(p.tagline, '') || ' ' ||
         coalesce(p.description, '')
       ) @@ websearch_to_tsquery('simple', p_query)
  order by
    case
      when p_query is null or trim(p_query) = '' then 0
      else ts_rank(
        to_tsvector(
          'simple',
          coalesce(p.name, '') || ' ' ||
          coalesce(p.tagline, '') || ' ' ||
          coalesce(p.description, '')
        ),
        websearch_to_tsquery('simple', p_query)
      )
    end desc,
    p.download_count desc nulls last
$$;

comment on function public.search_extensions(text) is
  'Ranks published extensions by full-text match plus install count.';
