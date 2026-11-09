-- ===========================================================================
-- Seed data: Extension details (Phase 5 mirror of src/data/extensionDetails.ts)
--
-- Idempotent: safe to run repeatedly. Requires the base catalogue seed
-- (supabase/seed.sql) to have been applied first, since every statement
-- looks extensions up by slug.
--
-- Run AFTER migrations + seed.sql, e.g. paste into the SQL editor.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Features + permissions (jsonb arrays on extensions)
-- ---------------------------------------------------------------------------
update public.extensions set
  features = '[
    {"title": "Fuzzy tab search", "description": "Reach any open tab in under a second."},
    {"title": "Session save & restore", "description": "Snapshot every window as a named session."},
    {"title": "Auto-suspend idle tabs", "description": "Reclaim RAM from tabs you are not looking at."},
    {"title": "Keyboard-first", "description": "Vim-like bindings for switching, closing and grouping."}
  ]'::jsonb,
  permissions = '[
    {"label": "Read browsing history", "description": "Used to power fuzzy tab search and recency ordering."},
    {"label": "Access tab information", "description": "Required to suspend and restore tabs."},
    {"label": "Storage (local)", "description": "Persists sessions and preferences on your device."}
  ]'::jsonb
where slug = 'velocity-tabs';

update public.extensions set
  features = '[
    {"title": "Tracker + fingerprint blocking"},
    {"title": "Malicious-site protection"},
    {"title": "Open-source filter lists"},
    {"title": "Per-site strictness"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Required to inject blocking rules."},
    {"label": "Report incidents", "description": "Local, anonymised block statistics you can disable."}
  ]'::jsonb
where slug = 'shieldlock';

update public.extensions set
  features = '[
    {"title": "Overlay rulers"},
    {"title": "Contrast checker"},
    {"title": "Colour pick from any element"},
    {"title": "Copy CSS values"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Only used to overlay measurement guides."}
  ]'::jsonb
where slug = 'pixel-perfect';

update public.extensions set
  features = '[
    {"title": "Inline network inspector"},
    {"title": "localStorage editor"},
    {"title": "API preview panel"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read tab data", "description": "Needed to attach the network inspector."},
    {"label": "Modify storage", "description": "Enables the localStorage editor."}
  ]'::jsonb
where slug = 'devscope';

update public.extensions set
  features = '[
    {"title": "Rewrite, translate, summarise"},
    {"title": "Bring your own model"},
    {"title": "Works in any textarea"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Only reads textarea content on demand."},
    {"label": "Network access (your API keys)", "description": "Sends selected text to your chosen model provider."}
  ]'::jsonb
where slug = 'copilot-canvas';

update public.extensions set
  features = '[
    {"title": "Automatic coupon hunting"},
    {"title": "Price-drop alerts"},
    {"title": "Wishlist tracking"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read shopping site data", "description": "Only on supported stores, on demand."},
    {"label": "Storage (sync)", "description": "Keeps your wishlist across signed-in devices."}
  ]'::jsonb
where slug = 'cartwatch';

update public.extensions set
  features = '[
    {"title": "Time-box distracting sites"},
    {"title": "Deep-work mode scheduling"},
    {"title": "Notification silencing"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read browsing history", "description": "Matches sites against your block list."}
  ]'::jsonb
where slug = 'focus-flow';

update public.extensions set
  features = '[
    {"title": "Live preview"},
    {"title": "One-click export (HTML, PDF)"},
    {"title": "Works on any textarea"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read form input", "description": "Reads only the textarea you are currently editing."}
  ]'::jsonb
where slug = 'markdown-anywhere';

update public.extensions set
  features = '[
    {"title": "Eyedropper over images, video and page"},
    {"title": "Palette export (CSS, JSON)"},
    {"title": "Copy as HEX / RGB / HSL"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Only used to sample pixel colour from the current page."}
  ]'::jsonb
where slug = 'color-pickr';

update public.extensions set
  features = '[
    {"title": "Zero-knowledge passkey generation"},
    {"title": "End-to-end encrypted vault"},
    {"title": "Autofill with biometric unlock"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Required to fill credentials on sign-in forms."},
    {"label": "Native messaging", "description": "Communicates with the local VaultPass agent for encryption."}
  ]'::jsonb
where slug = 'vaultpass';

update public.extensions set
  features = '[
    {"title": "Component tree inspection"},
    {"title": "Live props, state and hooks editor"},
    {"title": "Profiler for re-render hot spots"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Required to attach the React panel to pages built with React."},
    {"label": "Developer tools access", "description": "Adds the React tabs to the browser developer tools."}
  ]'::jsonb
where slug = 'react-developer-tools';

update public.extensions set
  features = '[
    {"title": "Redirect, rewrite and block rules"},
    {"title": "Mock API responses"},
    {"title": "Header overrides"},
    {"title": "Shareable rule groups"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Needed to intercept and rewrite network requests."},
    {"label": "Storage (sync)", "description": "Keeps your rules across signed-in devices."}
  ]'::jsonb
where slug = 'requestly';

update public.extensions set
  features = '[
    {"title": "Automated WCAG scans"},
    {"title": "Guided remediation steps"},
    {"title": "Keyboard and contrast checks"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Runs the audit against the page you are inspecting."}
  ]'::jsonb
where slug = 'axe-devtools';

update public.extensions set
  features = '[
    {"title": "Per-site cookie list"},
    {"title": "Add, edit and delete in place"},
    {"title": "Import and export (JSON)"},
    {"title": "Search and filter"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read cookies", "description": "Lists the cookies set for the current site."},
    {"label": "Modify cookies", "description": "Enables editing, deleting and importing cookies."}
  ]'::jsonb
where slug = 'cookie-editor';

update public.extensions set
  features = '[
    {"title": "One-click page clipping"},
    {"title": "Notes, lists and reminders"},
    {"title": "Sync across signed-in devices"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Used to clip the page you are on into a note."},
    {"label": "Google account access", "description": "Keeps notes in sync with your Keep account."}
  ]'::jsonb
where slug = 'google-keep';

update public.extensions set
  features = '[
    {"title": "Collapse all tabs into one list"},
    {"title": "Restore one tab or everything"},
    {"title": "Share a tab list as a link"},
    {"title": "Cuts memory use straight away"}
  ]'::jsonb,
  permissions = '[
    {"label": "Access tab information", "description": "Required to collapse and restore your open tabs."},
    {"label": "Storage (local)", "description": "Keeps saved tab lists on your device."}
  ]'::jsonb
where slug = 'onetab';

update public.extensions set
  features = '[
    {"title": "Add the current page as a task"},
    {"title": "Quick add with due dates"},
    {"title": "Today and project views"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Only read when you add the page as a task."},
    {"label": "Storage (sync)", "description": "Syncs tasks with your Todoist account."}
  ]'::jsonb
where slug = 'todoist';

update public.extensions set
  features = '[
    {"title": "Save pages to any Notion database"},
    {"title": "Keeps title, URL and highlights"},
    {"title": "Works with team workspaces"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Captures the page title, URL and selected text."},
    {"label": "Notion workspace access", "description": "Writes the clip into the destination you choose."}
  ]'::jsonb
where slug = 'notion-web-clipper';

update public.extensions set
  features = '[
    {"title": "End-to-end encrypted vault"},
    {"title": "Autofill and password generator"},
    {"title": "Passkey support"},
    {"title": "Open-source and independently audited"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Required to fill credentials on sign-in forms."},
    {"label": "Storage (sync)", "description": "Syncs your encrypted vault across signed-in devices."}
  ]'::jsonb
where slug = 'bitwarden';

update public.extensions set
  features = '[
    {"title": "Blocks ads, trackers and pop-ups"},
    {"title": "Declarative filtering rules"},
    {"title": "Per-site strictness levels"}
  ]'::jsonb,
  permissions = '[
    {"label": "Block content on allowed sites", "description": "Applied through declarative rules instead of reading page content."},
    {"label": "Storage (local)", "description": "Keeps your filter settings on your device."}
  ]'::jsonb
where slug = 'ublock-origin-lite';

update public.extensions set
  features = '[
    {"title": "Ad, pop-up and tracker filtering"},
    {"title": "Cosmetic filtering of page elements"},
    {"title": "Optional parental control and safe search"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Needed to hide ads and block tracking requests."},
    {"label": "Storage (sync)", "description": "Keeps your filter settings across devices."}
  ]'::jsonb
where slug = 'adguard';

update public.extensions set
  features = '[
    {"title": "Chat about the current page"},
    {"title": "Drafting and summarising"},
    {"title": "Research with citations"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Lets the assistant answer questions about the page you are on."},
    {"label": "Network access to your AI provider", "description": "Sends prompts to the model you select."}
  ]'::jsonb
where slug = 'monica';

update public.extensions set
  features = '[
    {"title": "Sidebar chat on any site"},
    {"title": "Explain and translate selections"},
    {"title": "Summarise articles and PDFs"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Required for page summaries and explanations."},
    {"label": "Network access to your AI provider", "description": "Only used when you send a prompt."}
  ]'::jsonb
where slug = 'sider';

update public.extensions set
  features = '[
    {"title": "Summarise long pages"},
    {"title": "Draft replies and emails"},
    {"title": "Bring your own model"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Used when you ask for a summary or draft."},
    {"label": "Storage (local)", "description": "Keeps your prompt history on your device."}
  ]'::jsonb
where slug = 'merlin';

update public.extensions set
  features = '[
    {"title": "AI commands and prompts"},
    {"title": "Page monitoring and change alerts"},
    {"title": "Saved automation workflows"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Needed to run automations on pages you choose."},
    {"label": "Network access to your AI provider", "description": "Sends commands to the model you configure."}
  ]'::jsonb
where slug = 'harpa-ai';

update public.extensions set
  features = '[
    {"title": "Mockup overlay with opacity control"},
    {"title": "Pixel-level comparison"},
    {"title": "Works on responsive layouts"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Only used to draw the mockup overlay on the page."}
  ]'::jsonb
where slug = 'perfectpixel';

update public.extensions set
  features = '[
    {"title": "Curated inspiration feed"},
    {"title": "UI and colour pattern collections"},
    {"title": "Replaces the new tab page"}
  ]'::jsonb,
  permissions = '[
    {"label": "Replace the new tab page", "description": "Needed to show the inspiration feed instead of a blank tab."},
    {"label": "Storage (local)", "description": "Remembers saved items and preferences."}
  ]'::jsonb
where slug = 'muzli';

update public.extensions set
  features = '[
    {"title": "Eyedropper on any pixel"},
    {"title": "HEX, RGB and HSL output"},
    {"title": "Palette history"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read and change all your data on websites", "description": "Only used to sample colours from the current page."}
  ]'::jsonb
where slug = 'colorzilla';

update public.extensions set
  features = '[
    {"title": "Price comparison across retailers"},
    {"title": "Automatic coupon testing"},
    {"title": "Wishlist price alerts"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read shopping site data", "description": "Only on supported retailers, when a product page loads."},
    {"label": "Storage (sync)", "description": "Keeps your watchlist across signed-in devices."}
  ]'::jsonb
where slug = 'capital-one-shopping';

update public.extensions set
  features = '[
    {"title": "Price history charts"},
    {"title": "Price-drop alerts"},
    {"title": "Deal score grading"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read Amazon product pages", "description": "Used to embed the price history chart."},
    {"label": "Storage (sync)", "description": "Keeps your tracked products in sync."}
  ]'::jsonb
where slug = 'keepa';

update public.extensions set
  features = '[
    {"title": "Automatic coupon testing"},
    {"title": "Cashback offers"},
    {"title": "Checkout price alerts"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read shopping site data", "description": "Needed to find and apply coupons at checkout."},
    {"label": "Storage (sync)", "description": "Tracks earned cashback in your account."}
  ]'::jsonb
where slug = 'coupert';

update public.extensions set
  features = '[
    {"title": "Queue posts from any page"},
    {"title": "Multi-channel scheduling"},
    {"title": "Post performance insights"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Used to build a post from what you are viewing."},
    {"label": "Storage (sync)", "description": "Syncs the queue with your Buffer account."}
  ]'::jsonb
where slug = 'buffer';

update public.extensions set
  features = '[
    {"title": "Email addresses for any site"},
    {"title": "Contact and role details"},
    {"title": "One-click email verification"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current website address", "description": "Needed to look up contacts for the site you visit."},
    {"label": "Storage (local)", "description": "Keeps your recent lookups on your device."}
  ]'::jsonb
where slug = 'hunter';

update public.extensions set
  features = '[
    {"title": "On-page SEO audit"},
    {"title": "Keyword and density analysis"},
    {"title": "Authority and traffic metrics"}
  ]'::jsonb,
  permissions = '[
    {"label": "Read the current page", "description": "Required to audit the page and its metadata."},
    {"label": "Storage (local)", "description": "Remembers your panel preferences."}
  ]'::jsonb
where slug = 'seoquake';

-- ---------------------------------------------------------------------------
-- Per-browser install URLs (mirrors INSTALL_URLS in extensionDetails.ts)
-- ---------------------------------------------------------------------------
update public.extension_browsers eb set install_url = case
  when br.slug = 'chrome'  then 'https://chromewebstore.google.com/detail/' || e.slug
  when br.slug = 'firefox' then 'https://addons.mozilla.org/firefox/addon/' || e.slug || '/'
  when br.slug = 'edge'    then 'https://microsoftedge.microsoft.com/addons/detail/' || e.slug
  when br.slug = 'safari'  then 'https://apps.apple.com/safari/app/' || e.slug
  when br.slug = 'opera'   then 'https://addons.opera.com/en/extensions/details/' || e.slug || '/'
end
from public.browsers br, public.extensions e
where eb.browser_id = br.id and eb.extension_id = e.id;

-- ---------------------------------------------------------------------------
-- Reviews (one insert per extension; deterministic ids keep this idempotent)
-- ---------------------------------------------------------------------------
insert into public.reviews (id, extension_id, author_name, rating, title, body, created_at)
values
  ('00000000-0000-4000-8000-000000000001',
   (select id from public.extensions where slug = 'velocity-tabs'),
   'Mika L.', 5, 'Replaced my tab manager',
   'I run 100+ tabs daily and Velocity Tabs is the first thing that made that actually manageable. Search is instant.',
   '2026-08-12T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000002',
   (select id from public.extensions where slug = 'velocity-tabs'),
   'Priya R.', 4, 'Great, small learning curve',
   'Keyboard shortcuts took a week to stick, but now I never touch the mouse to switch tabs.',
   '2026-06-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000003',
   (select id from public.extensions where slug = 'shieldlock'),
   'Dan K.', 5, 'Set it and forget it',
   'Blocks everything I expect without breaking site layouts. Rare combo.',
   '2026-09-01T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000004',
   (select id from public.extensions where slug = 'pixel-perfect'),
   'Alina B.', 5, 'My design QA is faster now',
   'Handoff checks that used to take 20 minutes are down to about 3.',
   '2026-07-19T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000005',
   (select id from public.extensions where slug = 'devscope'),
   'Ilya M.', 4, null,
   'The storage editor alone is worth it. Would like a request replay feature next.',
   '2026-05-04T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000006',
   (select id from public.extensions where slug = 'copilot-canvas'),
   'Tomas F.', 4, null,
   'Featherweight, respects BYO model, and does not send anything without a click.',
   '2026-08-28T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000007',
   (select id from public.extensions where slug = 'cartwatch'),
   'Bea V.', 4, null,
   'Saved me about $80 across two months. No-brainer install.',
   '2026-07-30T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000008',
   (select id from public.extensions where slug = 'focus-flow'),
   'Sam O.', 5, 'Genuinely helped',
   'The scheduling keeps my evenings off social media without me having to decide.',
   '2026-09-15T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000009',
   (select id from public.extensions where slug = 'markdown-anywhere'),
   'Jin P.', 5, null,
   'Fast, tidy, no telemetry. My default now for anything longer than a comment.',
   '2026-06-18T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000010',
   (select id from public.extensions where slug = 'color-pickr'),
   'Kia N.', 4, null,
   'Simple and fast. Would love a colour-blind-safe palette suggestion mode.',
   '2026-08-05T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000011',
   (select id from public.extensions where slug = 'vaultpass'),
   'Nora S.', 5, null,
   'Migration from my old manager was one-click and everything was where I expected it.',
   '2026-10-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000012',
   (select id from public.extensions where slug = 'vaultpass'),
   'Rob J.', 4, 'Solid, occasional slow unlock',
   'Rarely, biometric unlock takes a beat longer than I want. Everything else is spot-on.',
   '2026-08-22T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000013',
   (select id from public.extensions where slug = 'react-developer-tools'),
   'Owen G.', 5, 'Still the first install I do',
   'The component tree and hooks view make debugging a React app in production builds far less painful.',
   '2026-09-08T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000014',
   (select id from public.extensions where slug = 'requestly'),
   'Hana T.', 4, 'Replaced a local proxy setup',
   'Redirecting staged assets onto production pages without a proxy is the killer feature for me.',
   '2026-09-24T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000015',
   (select id from public.extensions where slug = 'axe-devtools'),
   'Marta C.', 5, 'Caught issues QA never would',
   'The guided fixes are what make it useful. A rule name alone would have taken me an hour to act on.',
   '2026-10-11T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000016',
   (select id from public.extensions where slug = 'cookie-editor'),
   'Dex W.', 5, null,
   'Export/import of cookies between environments saved me from recreating a session by hand.',
   '2026-08-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000017',
   (select id from public.extensions where slug = 'google-keep'),
   'Ada P.', 5, 'Fastest way to jot something down',
   'Clipping a page into Keep takes one click, and the reminders show up on my phone straight away.',
   '2026-09-19T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000018',
   (select id from public.extensions where slug = 'onetab'),
   'Bezim T.', 4, 'Saved my laptop',
   'Two hundred tabs became one list and the fan finally went quiet. Restoring a single tab is a bit fiddly.',
   '2026-07-11T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000019',
   (select id from public.extensions where slug = 'todoist'),
   'Selin K.', 5, 'Inbox zero, finally',
   'Adding a page as a task from the toolbar is the whole reason I stopped using bookmarks.',
   '2026-10-05T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000020',
   (select id from public.extensions where slug = 'notion-web-clipper'),
   'Ravi D.', 4, null,
   'Works well with databases. I would like a default destination per site.',
   '2026-08-16T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000021',
   (select id from public.extensions where slug = 'bitwarden'),
   'Tomasz B.', 5, 'Free tier is genuinely enough',
   'Passkey autofill works on every site I use daily, and the open-source audit trail is why I switched.',
   '2026-09-27T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000022',
   (select id from public.extensions where slug = 'ublock-origin-lite'),
   'Nadia S.', 4, 'Clean pages, no fuss',
   'Default settings already kill most ads. A few strict sites needed a manual level bump.',
   '2026-10-14T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000023',
   (select id from public.extensions where slug = 'adguard'),
   'Jorge A.', 5, 'Best at cosmetic cleanup',
   'It removes the empty ad boxes too, so layouts no longer jump around while loading.',
   '2026-08-19T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000024',
   (select id from public.extensions where slug = 'monica'),
   'Yuki N.', 5, 'One assistant for every tab',
   'Asking questions about the page without copying text into another app is the whole win for me.',
   '2026-09-30T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000025',
   (select id from public.extensions where slug = 'sider'),
   'Piotr L.', 4, 'Handy sidebar, slightly chatty',
   'Page summaries are accurate. I turned off proactive suggestions because they popped up too often.',
   '2026-10-08T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000026',
   (select id from public.extensions where slug = 'merlin'),
   'Rosa M.', 4, null,
   'Drafting replies from the toolbar saves me a lot of typing on long threads.',
   '2026-07-22T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000027',
   (select id from public.extensions where slug = 'harpa-ai'),
   'Ken I.', 5, 'Automation is the differentiator',
   'Saved workflows that watch a page and alert me only when something changes have replaced two other tools.',
   '2026-10-19T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000028',
   (select id from public.extensions where slug = 'perfectpixel'),
   'Lena F.', 5, 'Mockup overlay saved my QA',
   'Dropping the design straight onto the build and sliding the opacity makes off-by-two-pixel bugs obvious.',
   '2026-09-12T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000029',
   (select id from public.extensions where slug = 'muzli'),
   'Omar Z.', 4, null,
   'Good inspiration feed. I would like more mobile app UI examples.',
   '2026-08-27T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000030',
   (select id from public.extensions where slug = 'colorzilla'),
   'Iris H.', 5, 'Still the fastest picker',
   'Eyedropper plus the copy as HEX shortcut is muscle memory for me now.',
   '2026-09-05T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000031',
   (select id from public.extensions where slug = 'capital-one-shopping'),
   'Dana W.', 4, 'Found cheaper alternatives',
   'It surfaced the same item at two other retailers for less. Coupon testing is hit and miss.',
   '2026-10-02T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000032',
   (select id from public.extensions where slug = 'keepa'),
   'Victor S.', 5, 'Price history is invaluable',
   'The chart told me a sale price was nothing special, so I waited and saved 30 dollars.',
   '2026-08-09T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000033',
   (select id from public.extensions where slug = 'coupert'),
   'Ana G.', 4, null,
   'Works quietly in the background and the cashback adds up, though payouts take a while.',
   '2026-07-16T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000034',
   (select id from public.extensions where slug = 'buffer'),
   'Meera J.', 5, 'Queue posts without tab hopping',
   'Adding a link to the queue from any page keeps my week planned in minutes.',
   '2026-09-23T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000035',
   (select id from public.extensions where slug = 'hunter'),
   'Ellis V.', 4, 'Great for outreach research',
   'Contacts on company pages come up reliably. Verification credits run out quickly on the free plan.',
   '2026-10-10T00:00:00.000Z'),
  ('00000000-0000-4000-8000-000000000036',
   (select id from public.extensions where slug = 'seoquake'),
   'Fabio R.', 4, null,
   'The on-page audit catches missing meta descriptions instantly. Interface feels dated.',
   '2026-08-31T00:00:00.000Z')
on conflict (id) do update
  set extension_id = excluded.extension_id, author_name = excluded.author_name,
      rating = excluded.rating, title = excluded.title, body = excluded.body,
      created_at = excluded.created_at;
