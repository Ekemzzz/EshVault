-- ===========================================================================
-- Migration 0001: Core schema
-- Browser Extension Directory
--
-- Apply with: `supabase db push`  (or paste into the Supabase SQL editor)
--
-- Contents: enum types, tables, primary/foreign keys (relationships),
--           uniqueness + CHECK constraints (data integrity), and indexes
--           (query performance). RLS, functions/views and storage live in
--           0002–0004.
-- ===========================================================================

-- Required for gen_random_uuid() and trigram search.
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------
do $$ begin
  create type public.extension_status as enum ('draft', 'pending', 'published', 'archived');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- authors
-- ---------------------------------------------------------------------------
create table if not exists public.authors (
  id          uuid primary key default gen_random_uuid(),
  name        text        not null,
  website     text,
  bio         text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint authors_name_not_blank check (char_length(trim(name)) > 0)
);

-- ---------------------------------------------------------------------------
-- categories
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null unique,
  label       text        not null,
  blurb       text,
  accent      text,                                  -- tailwind gradient tokens for the UI tile
  sort_order  integer     not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint categories_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- ---------------------------------------------------------------------------
-- browsers  (Chrome, Firefox, Edge, Safari, Opera…)
-- ---------------------------------------------------------------------------
create table if not exists public.browsers (
  id          uuid primary key default gen_random_uuid(),
  slug        text        not null unique,           -- 'chrome' | 'firefox' | 'edge' | 'safari' | 'opera'
  label       text        not null,
  dot         text,                                  -- tailwind bg class for the colour dot
  created_at  timestamptz not null default now(),
  constraint browsers_slug_format check (slug ~ '^[a-z0-9]+$')
);

-- ---------------------------------------------------------------------------
-- tags
-- ---------------------------------------------------------------------------
create table if not exists public.tags (
  id     uuid primary key default gen_random_uuid(),
  slug   text not null unique,
  label  text not null
);

-- ---------------------------------------------------------------------------
-- extensions  (the central entity)
--   relationships:
--     category_id -> categories.id   (required, restrict delete)
--     author_id   -> authors.id      (optional, nullify delete)
-- ---------------------------------------------------------------------------
create table if not exists public.extensions (
  id             uuid primary key default gen_random_uuid(),
  slug           text        not null unique,
  name           text        not null,
  tagline        text,
  description    text,
  category_id    uuid        not null references public.categories(id) on delete restrict,
  author_id      uuid        references public.authors(id)            on delete set null,
  icon_url       text,
  icon_path      text,                              -- storage object path (bucket 'extension-icons')
  website_url    text,
  store_url      text,
  download_count bigint      not null default 0 check (download_count >= 0),
  rating         numeric(3,2) check (rating >= 0 and rating <= 5),
  is_featured    boolean     not null default false,
  status         public.extension_status not null default 'published',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),

  constraint extensions_slug_format   check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint extensions_name_not_blank check (char_length(trim(name)) > 0)
);

-- ---------------------------------------------------------------------------
-- extension_browsers  (many-to-many: which browsers an extension supports)
-- ---------------------------------------------------------------------------
create table if not exists public.extension_browsers (
  extension_id uuid not null references public.extensions(id) on delete cascade,
  browser_id   uuid not null references public.browsers(id)   on delete cascade,
  primary key (extension_id, browser_id)
);

-- ---------------------------------------------------------------------------
-- extension_tags  (many-to-many)
-- ---------------------------------------------------------------------------
create table if not exists public.extension_tags (
  extension_id uuid not null references public.extensions(id) on delete cascade,
  tag_id       uuid not null references public.tags(id)        on delete cascade,
  primary key (extension_id, tag_id)
);

-- ---------------------------------------------------------------------------
-- screenshots  (one-to-many from extensions; stores storage object paths)
-- ---------------------------------------------------------------------------
create table if not exists public.screenshots (
  id            uuid primary key default gen_random_uuid(),
  extension_id  uuid    not null references public.extensions(id) on delete cascade,
  storage_path  text    not null,                  -- object path in bucket 'extension-screenshots'
  alt_text      text,
  position      integer not null default 0,
  created_at    timestamptz not null default now(),
  constraint screenshots_position_non_negative check (position >= 0)
);

-- ---------------------------------------------------------------------------
-- Indexes (relationship + hot query paths)
-- ---------------------------------------------------------------------------
create index if not exists extensions_category_id_idx  on public.extensions (category_id);
create index if not exists extensions_author_id_idx     on public.extensions (author_id);
create index if not exists extensions_status_idx         on public.extensions (status);
create index if not exists extensions_is_featured_idx    on public.extensions (is_featured) where is_featured;
create index if not exists extensions_download_count_idx on public.extensions (download_count desc);
create index if not exists extensions_created_at_idx     on public.extensions (created_at desc);

-- Text search over name + tagline + description.
create index if not exists extensions_search_idx on public.extensions
  using gin (to_tsvector('simple',
    coalesce(name, '')       || ' ' ||
    coalesce(tagline, '')    || ' ' ||
    coalesce(description, '')));

-- Fuzzy / typo-tolerant name lookup.
create index if not exists extensions_name_trgm_idx on public.extensions
  using gin (name public.gin_trgm_ops);

create index if not exists extension_browsers_browser_id_idx on public.extension_browsers (browser_id);
create index if not exists extension_tags_tag_id_idx          on public.extension_tags (tag_id);
create index if not exists screenshots_extension_id_idx       on public.screenshots (extension_id, position);
