# EshVault

A curated directory of browser extensions. Visitors can browse and filter the
catalogue, compare up to three extensions side by side, save favourites, and
review what they have used. Signed-in users can submit their own extension,
which enters an admin moderation queue and only goes live once approved.

Built as a single-page React app with Supabase as the backend (Postgres, Auth,
Storage, Row Level Security). There is no custom server: the browser talks to
Supabase directly, and every write is gated by an RLS policy.

## What it does

- **Browse** with search, filters (browser, category, pricing) and sorting.
- **Detail pages** with features, permissions, per-browser install links,
  screenshots, ratings and reviews.
- **Compare** up to three extensions in a table.
- **Accounts**: register, log in, password reset, profile.
- **Saved list** per user.
- **Reviews** with star ratings and helpful votes (one vote per review, and
  you cannot vote on your own).
- **Submissions**: user-submitted extensions go to a pending queue.
- **Admin dashboard**: approve or reject submissions, edit or delete
  extensions, manage categories, moderate reviews.

## Tech stack

| Layer | Choice |
| --- | --- |
| Build | Vite 5 |
| UI | React 18, TypeScript 5, Tailwind CSS 3, Framer Motion |
| Routing | react-router-dom 6 (route-level code splitting) |
| Backend | Supabase (Postgres, Auth, Storage, RLS) |

## Requirements

- Node.js 18 or newer
- npm
- A Supabase project (or access to an existing one)

## Local setup

```bash
npm install
cp .env.example .env    # then fill in your own values
npm run dev
```

Vite prints the URL it picked. If port 5173 is busy it moves to 5174, and so
on. Note that a Supabase session is stored per origin, so signing in on one
port does not sign you in on another.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-checks `src` and `vite.config.ts`, then builds to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Type-checks only, no build |

## Environment variables

| Variable | Notes |
| --- | --- |
| `VITE_SUPABASE_URL` | Project URL, `https://<ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public/publishable key (`sb_publishable_...` or a legacy `eyJ...` JWT) |
| `VITE_APP_NAME` | Display name used in titles and metadata |

Only the public anon key belongs in the browser. A secret or service-role key
must never appear in a `VITE_` variable: it bypasses Row Level Security and
would be readable by any visitor. Values are read at build time, so changing
them means restarting the dev server or rebuilding.

If the variables are missing, the app still boots but falls back to the mock
catalogue in `src/data/`, and account features are unavailable.

## Database

Migrations live in `supabase/migrations/` and must be applied in filename order.

| Migration | Purpose |
| --- | --- |
| `0001_core_schema` | Extensions, categories, browsers, authors, tags |
| `0002_functions_and_views` | `is_admin()`, `published_extensions` view, search RPC |
| `0003_rls_policies` | Public read, admin write |
| `0004_storage` | Icon and screenshot buckets plus policies |
| `0005_pricing` | Pricing tiers and filters |
| `0006_details` | Reviews, features, permissions, screenshots |
| `0007_auth` | Profiles, saved list, helpful votes |
| `0008_submissions` | Pending submissions queue and withdrawal |

Then seed the catalogue, in this order:

1. `supabase/seed.sql` creates categories, browsers, authors and extensions.
2. `supabase/seed_details.sql` adds features, permissions and review samples,
   plus a placeholder install URL built from each slug. It looks rows up by
   slug, so `seed.sql` must run first.
3. `supabase/seed_install_links.sql` replaces those placeholders with the real
   store listing for each browser. It has to run last, because step 2 overwrites
   every install URL it touches.

All three files are idempotent and safe to re-run, in that order.

### Visibility

Rows in `extensions` carry a `status` (`pending`, `published`, `rejected`,
`archived`). The app reads from the `published_extensions` view, so anything
that is not `published` is invisible to visitors without extra filtering.

### Granting admin access

There is deliberately no in-app path to become an admin. Run this in the
Supabase SQL editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', 'admin')
where lower(email) = lower('you@example.com');
```

Then **sign out and sign back in**. The role is baked into the JWT at issue
time, so an existing session keeps the old claim and `/admin` will show the
"Administrators only" panel until you re-authenticate. The client reads
`app_metadata.role`, and `public.is_admin()` reads the same claim server side.

To revoke:

```sql
update auth.users
set raw_app_meta_data = raw_app_meta_data - 'role'
where lower(email) = lower('you@example.com');
```

## Project structure

```
src/
  components/     UI, grouped by area (admin, auth, compare, detail, explore, ...)
  pages/          One file per route
  services/       All Supabase reads and writes, one module per domain
  hooks/          Reusable state (auth, compare, explore, theme)
  lib/            env access, Supabase client, SEO hook, motion presets
  data/           Mock catalogue and detail content used when Supabase is unset
  types/          Shared types, including database row shapes
supabase/
  migrations/     Schema, functions, policies, storage, auth, submissions
  seed.sql        Base catalogue
  seed_details.sql  Detail content and sample reviews
  seed_install_links.sql  Real store URLs for each browser
```

Data access goes through `src/services/` only. Components do not call
`supabase` directly, which keeps RLS error handling and mock fallbacks in one
place.

## Conventions

- No em dashes in copy, comments, seeds or SQL. Use a period, colon or comma.
- Import with the `@/` alias, configured in both `tsconfig.app.json` and
  `vite.config.ts`. Change one, change the other.
- Mock data is always gated by `isSupabaseConfigured` so real credentials never
  render fake content.
- Database types in `src/types/database.ts` must match the SQL schema.

## Deploying

Order matters, because Supabase needs the live URL.

1. **Host** (Vercel or similar): build command `npm run build`, output
   directory `dist`. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` and
   `VITE_APP_NAME` in the project settings.
2. **SPA rewrite**: a static host returns 404 for deep links such as
   `/extensions/<slug>` unless all unknown paths fall back to `index.html`.
   `vercel.json` already does this, plus long-lived caching for `/assets` and a
   few security headers.

3. **Supabase Auth**: Authentication then URL Configuration. Set Site URL to
   the production domain and add `https://<domain>/auth/callback` to Redirect
   URLs. Registration and password reset both redirect there.
4. **Email**: configure custom SMTP, then enable Confirm email. Without SMTP,
   password reset depends on a rate-limited built-in sender.
5. **Domain placeholders**: replace `YOUR-DOMAIN.example` in
   `public/sitemap.xml` and make the `Sitemap:` line in `public/robots.txt`
   an absolute URL.
6. **Admin hygiene**: revoke the admin role from any throwaway test account.

### Content still to finish

- Install links: `seed_install_links.sql` fills 60 of the 68 browser pairs
  with a verified store listing. The eight that stay empty are browsers where
  no listing could be confirmed: Edge for Google Keep, Notion, Buffer, Merlin
  and HARPA, Firefox for HARPA, Safari for Bitwarden, and Chrome for Capital
  One Shopping, whose listing page would not name the extension. Those pages
  offer the official site instead. Check any link you add later carries the id
  its store uses, a 32 character id for Chrome and Edge, a numeric id for
  Safari, or the detail page hides the button.
- The `screenshots` table is empty, so detail pages show placeholder panels.
- The seeded reviews have no author account behind them and use invented
  names. Clear them before launch if that matters to you.
