-- ===========================================================================
-- Migration 0002: Functions, triggers, views
--
--  * handle_updated_at(): keeps updated_at fresh on mutable rows
--  * is_admin(): authorisation helper used by RLS + storage
--  * published_extensions: security-invoker view flattening relations for
--                          public reads (one query -> category, author,
--                          browser slugs, tag slugs, screenshot paths)
--  * search_extensions(): full-text search over published extensions
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  execute format('drop trigger if exists set_updated_at on %s', 'public.extensions');
  execute format('create trigger set_updated_at before update on %s for each row execute function public.handle_updated_at()', 'public.extensions');
end $$;

do $$ begin
  execute format('drop trigger if exists set_updated_at on %s', 'public.authors');
  execute format('create trigger set_updated_at before update on %s for each row execute function public.handle_updated_at()', 'public.authors');
end $$;

do $$ begin
  execute format('drop trigger if exists set_updated_at on %s', 'public.categories');
  execute format('create trigger set_updated_at before update on %s for each row execute function public.handle_updated_at()', 'public.categories');
end $$;

-- ---------------------------------------------------------------------------
-- is_admin(): true when the caller's JWT app_metadata.role = 'admin'.
-- Used by RLS and storage policies. Never trusts client-supplied flags.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin',
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- published_extensions view (only status = 'published')
-- security_invoker=on  =>  the view respects the underlying tables' RLS,
-- so an anonymous viewer can only ever see published rows.
-- ---------------------------------------------------------------------------
create or replace view public.published_extensions
with (security_invoker = on) as
select
  e.id,
  e.slug,
  e.name,
  e.tagline,
  e.description,
  e.category_id,
  c.slug        as category_slug,
  c.label       as category_label,
  c.accent      as category_accent,
  a.id          as author_id,
  a.name        as author_name,
  a.website     as author_website,
  e.icon_url,
  e.icon_path,
  e.website_url,
  e.store_url,
  e.download_count,
  e.rating,
  e.is_featured,
  e.status,
  e.created_at,
  e.updated_at,
  coalesce(bc.slugs, '{}') as browser_slugs,
  coalesce(tc.slugs, '{}') as tag_slugs,
  coalesce(sc.paths, '{}') as screenshot_paths
from public.extensions e
join public.categories c on c.id = e.category_id
left join public.authors a on a.id = e.author_id
left join lateral (
  select array_agg(b.slug order by b.label) as slugs
  from public.extension_browsers eb
  join public.browsers b on b.id = eb.browser_id
  where eb.extension_id = e.id
) bc on true
left join lateral (
  select array_agg(t.slug order by t.label) as slugs
  from public.extension_tags et
  join public.tags t on t.id = et.tag_id
  where et.extension_id = e.id
) tc on true
left join lateral (
  select array_agg(s.storage_path order by s.position) as paths
  from public.screenshots s
  where s.extension_id = e.id
) sc on true
where e.status = 'published';

-- ---------------------------------------------------------------------------
-- search_extensions(): ranked full-text search over published extensions.
-- Empty/NULL query returns everything, ordered by popularity.
-- ---------------------------------------------------------------------------
create or replace function public.search_extensions(p_query text default null)
returns setof public.published_extensions
language sql
stable
as $$
  select pe.*
  from public.published_extensions pe
  where p_query is null
     or btrim(p_query) = ''
     or to_tsvector('simple',
          coalesce(pe.name,'') || ' ' || coalesce(pe.tagline,'') || ' ' || coalesce(pe.description,'')
        ) @@ websearch_to_tsquery('simple', p_query)
  order by
    case
      when p_query is null or btrim(p_query) = '' then pe.download_count
      else (ts_rank(to_tsvector('simple',
             coalesce(pe.name,'')||' '||coalesce(pe.tagline,'')||' '||coalesce(pe.description,'')),
             websearch_to_tsquery('simple', p_query)) * 1000000 + pe.download_count)::bigint
    end desc;
$$;

-- ---------------------------------------------------------------------------
-- Grants: read-only surface for anon + authenticated roles.
-- ---------------------------------------------------------------------------
grant usage on schema public to anon, authenticated;
grant select on public.published_extensions to anon, authenticated;
grant execute on function public.search_extensions(text) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
