-- =============================================================
-- Migration 07: Authentication and user features (Phase 6)
-- Adds:
--   • public.profiles          (1:1 with auth.users, auto-created on signup)
--   • public.saved_extensions  (per-user bookmarks)
--   • public.helpful_votes     (one "was this helpful?" per user per review)
--   • reviews.user_id          (reviews bind to accounts; legacy seeded
--                               reviews keep a NULL user_id and stay valid)
--   • duplicate-review guard   (unique partial index: one review per user
--                               per extension)
--   • RLS for all of the above: users manage ONLY their own rows.
-- =============================================================

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  display_name text        not null,
  avatar_url   text,
  bio          text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint profiles_display_name_not_blank check (char_length(trim(display_name)) between 1 and 80)
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by owner" on public.profiles;
create policy "profiles readable by owner" on public.profiles
  for select to authenticated
  using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles insert own" on public.profiles;
create policy "profiles insert own" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "admin manages profiles" on public.profiles;
create policy "admin manages profiles" on public.profiles
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Auto-create a profile whenever a user signs up.
-- security definer so it can write into profiles regardless of RLS; the
-- inserting row is always the new user's own id.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      split_part(coalesce(new.email, 'user'), '@', 1)
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- saved_extensions (bookmarks)
-- ---------------------------------------------------------------------------
create table if not exists public.saved_extensions (
  user_id      uuid not null references auth.users(id)  on delete cascade,
  extension_id uuid not null references public.extensions(id) on delete cascade,
  created_at   timestamptz not null default now(),
  primary key (user_id, extension_id)
);

create index if not exists saved_extensions_extension_id_idx
  on public.saved_extensions (extension_id);

alter table public.saved_extensions enable row level security;

drop policy if exists "saved_extensions own rows" on public.saved_extensions;
create policy "saved_extensions own rows" on public.saved_extensions
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- helpful_votes (one vote per user per review)
-- ---------------------------------------------------------------------------
create table if not exists public.helpful_votes (
  id         uuid primary key default gen_random_uuid(),
  review_id  uuid not null references public.reviews(id) on delete cascade,
  user_id    uuid not null references auth.users(id)     on delete cascade,
  created_at timestamptz not null default now(),
  constraint helpful_votes_review_user_unique unique (review_id, user_id)
);

create index if not exists helpful_votes_review_id_idx
  on public.helpful_votes (review_id);

alter table public.helpful_votes enable row level security;

-- Counts are public (embedded by the reviews read path); a vote row itself
-- carries no private data beyond the voter's public user id.
drop policy if exists "helpful_votes readable" on public.helpful_votes;
create policy "helpful_votes readable" on public.helpful_votes
  for select to anon, authenticated using (true);

drop policy if exists "helpful_votes insert own" on public.helpful_votes;
create policy "helpful_votes insert own" on public.helpful_votes
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "helpful_votes delete own" on public.helpful_votes;
create policy "helpful_votes delete own" on public.helpful_votes
  for delete to authenticated
  using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- reviews: bind to accounts
--   * user_id nullable so the Phase 5 seeded reviews remain valid.
--   * one review per user per extension (duplicate prevention at the DB
--     level; NULL user_ids are excluded from the unique index).
-- ---------------------------------------------------------------------------
alter table public.reviews
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists reviews_extension_user_uniq
  on public.reviews (extension_id, user_id)
  where user_id is not null;

create index if not exists reviews_user_id_idx
  on public.reviews (user_id);

-- Self-service alongside the existing reviews_admin_all policy.
drop policy if exists "reviews insert own" on public.reviews;
create policy "reviews insert own" on public.reviews
  for insert to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "reviews update own" on public.reviews;
create policy "reviews update own" on public.reviews
  for update to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "reviews delete own" on public.reviews;
create policy "reviews delete own" on public.reviews
  for delete to authenticated
  using (auth.uid() = user_id);
