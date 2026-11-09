-- ===========================================================================
-- Seed data: Browser Extension Directory (development)
--
-- Idempotent: safe to run repeatedly. Mirrors the Phase 2 mock catalogue so
-- the seeded database matches what the UI already displays.
--
-- Run after the migrations, e.g.:  supabase db reset  (applies migrations+seed)
-- or paste into the SQL editor.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
insert into public.categories (id, slug, label, blurb, accent, sort_order) values
  ('c0000000-0000-0000-0000-000000000001', 'productivity',  'Productivity',          'Tab managers, notes and automation',   'from-amber-400 to-orange-500',   1),
  ('c0000000-0000-0000-0000-000000000002', 'security',      'Security & Privacy',    'Blockers, vaults and protection',      'from-emerald-400 to-teal-500',   2),
  ('c0000000-0000-0000-0000-000000000003', 'design',        'Design & Creativity',  'Colour, font and layout tools',        'from-pink-400 to-rose-500',      3),
  ('c0000000-0000-0000-0000-000000000004', 'development',   'Developer Tools',      'Inspectors and API helpers',           'from-sky-400 to-indigo-500',     4),
  ('c0000000-0000-0000-0000-000000000005', 'ai',            'AI & Automation',      'Writing, search copilots',             'from-violet-400 to-purple-500',  5),
  ('c0000000-0000-0000-0000-000000000006', 'shopping',      'Shopping & Deals',     'Coupons and price tracking',           'from-lime-400 to-green-500',     6),
  ('c0000000-0000-0000-0000-000000000007', 'social',        'Social Media & Marketing', 'Feeds, messaging and focus',        'from-cyan-400 to-blue-500',      7),
  ('c0000000-0000-0000-0000-000000000008', 'other',         'More',                 'Everything else worth a look',         'from-slate-400 to-gray-500',     8)
on conflict (id) do update
  set slug = excluded.slug, label = excluded.label, blurb = excluded.blurb,
      accent = excluded.accent, sort_order = excluded.sort_order;

-- ---------------------------------------------------------------------------
-- Browsers
-- ---------------------------------------------------------------------------
insert into public.browsers (id, slug, label, dot) values
  ('b0000000-0000-0000-0000-000000000001', 'chrome',  'Chrome',  'bg-red-500'),
  ('b0000000-0000-0000-0000-000000000002', 'firefox', 'Firefox', 'bg-orange-500'),
  ('b0000000-0000-0000-0000-000000000003', 'edge',    'Edge',    'bg-sky-500'),
  ('b0000000-0000-0000-0000-000000000004', 'safari',  'Safari',  'bg-blue-400'),
  ('b0000000-0000-0000-0000-000000000005', 'opera',   'Opera',   'bg-rose-500')
on conflict (id) do update set slug = excluded.slug, label = excluded.label, dot = excluded.dot;

-- ---------------------------------------------------------------------------
-- Authors
-- ---------------------------------------------------------------------------
insert into public.authors (id, name, website, bio) values
  ('d0000000-0000-0000-0000-000000000001', 'Acme Labs',  'https://acme.example.com',  'Tools for getting things done.'),
  ('d0000000-0000-0000-0000-000000000002', 'NightOwl',   null,                        'Indie developer.'),
  ('d0000000-0000-0000-0000-000000000003', 'Pixelworks', 'https://pixelworks.example', 'Design-first software studio.'),
  ('d0000000-0000-0000-0000-000000000004', 'SecureNet',  'https://securenet.example',  'Privacy and security tooling.'),
  ('d0000000-0000-0000-0000-000000000005', 'Meta Open Source', 'https://react.dev',          'Maintainers of the React ecosystem tooling.'),
  ('d0000000-0000-0000-0000-000000000006', 'Requestly',  'https://requestly.com',      'Developer tooling for testing and debugging web traffic.'),
  ('d0000000-0000-0000-0000-000000000007', 'Deque Systems', 'https://www.deque.com',   'Accessibility testing and compliance tooling.'),
  ('d0000000-0000-0000-0000-000000000008', 'Moustachauve', 'https://cookie-editor.com', 'Open-source browser utilities.'),
  ('d0000000-0000-0000-0000-000000000009', 'Google',     'https://keep.google.com',   'Google Workspace products.'),
  ('d0000000-0000-0000-0000-000000000010', 'OneTab',     'https://www.one-tab.com',   'Tab management utilities.'),
  ('d0000000-0000-0000-0000-000000000011', 'Doist',      'https://todoist.com',       'Task and project management apps.'),
  ('d0000000-0000-0000-0000-000000000012', 'Notion Labs', 'https://www.notion.com',    'Connected workspace software.'),
  ('d0000000-0000-0000-0000-000000000013', 'Bitwarden',  'https://bitwarden.com',     'Open-source password management.'),
  ('d0000000-0000-0000-0000-000000000014', 'Raymond Hill', 'https://github.com/uBlockOrigin', 'Author of the uBlock Origin content blockers.'),
  ('d0000000-0000-0000-0000-000000000015', 'Adguard Software', 'https://adguard.com', 'Ad blocking and privacy protection software.'),
  ('d0000000-0000-0000-0000-000000000016', 'Monica',     'https://monica.im',         'AI assistant software.'),
  ('d0000000-0000-0000-0000-000000000017', 'Sider AI',   'https://sider.ai',          'AI sidebar assistant.'),
  ('d0000000-0000-0000-0000-000000000018', 'Merlin AI',  'https://www.getmerlin.in',  'AI browsing assistant.'),
  ('d0000000-0000-0000-0000-000000000019', 'HARPA AI',   'https://harpa.ai',          'AI automation for the browser.'),
  ('d0000000-0000-0000-0000-000000000020', 'WellDoneCode', 'https://www.welldonecode.com', 'Front-end and design quality tooling.'),
  ('d0000000-0000-0000-0000-000000000021', 'Muzli',      'https://muz.li',            'Design inspiration curation.'),
  ('d0000000-0000-0000-0000-000000000022', 'Alex Sirota', 'https://www.colorzilla.com', 'Colour picking browser tools.'),
  ('d0000000-0000-0000-0000-000000000023', 'Capital One', 'https://capitaloneshopping.com', 'Shopping and savings services.'),
  ('d0000000-0000-0000-0000-000000000024', 'Keepa GmbH', 'https://keepa.com',         'Amazon price tracking data.'),
  ('d0000000-0000-0000-0000-000000000025', 'Coupert',    'https://www.coupert.com',   'Coupon and cashback discovery.'),
  ('d0000000-0000-0000-0000-000000000026', 'Buffer',     'https://buffer.com',        'Social media scheduling software.'),
  ('d0000000-0000-0000-0000-000000000027', 'Hunter',     'https://hunter.io',         'Email outreach and contact discovery.'),
  ('d0000000-0000-0000-0000-000000000028', 'Semrush',    'https://www.semrush.com',   'Search and SEO intelligence.')
on conflict (id) do update set name = excluded.name, website = excluded.website, bio = excluded.bio;

-- ---------------------------------------------------------------------------
-- Tags
-- ---------------------------------------------------------------------------
insert into public.tags (id, slug, label) values
  ('e0000000-0000-0000-0000-000000000001', 'privacy',   'Privacy'),
  ('e0000000-0000-0000-0000-000000000002', 'tabs',      'Tabs'),
  ('e0000000-0000-0000-0000-000000000003', 'ai',        'AI'),
  ('e0000000-0000-0000-0000-000000000004', 'productivity', 'Productivity')
on conflict (id) do update set slug = excluded.slug, label = excluded.label;

-- ---------------------------------------------------------------------------
-- Extensions (published)
-- ---------------------------------------------------------------------------
insert into public.extensions
  (id, slug, name, tagline, description, category_id, author_id, website_url, download_count, pricing, is_featured, status)
values
  ('f0000000-0000-0000-0000-000000000001', 'velocity-tabs', 'Velocity Tabs', 'Supercharge your tab workflow',
   'Group, suspend and search thousands of tabs instantly. Save sessions and restore them with a keystroke.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'https://example.com/velocity-tabs', 1200000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000002', 'shieldlock', 'ShieldLock', 'Private by default browsing',
   'Block trackers, fingerprinting and malicious sites with a lightweight, open-source privacy engine.',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', null, 3400000, 'freemium', false, 'archived'),

  ('f0000000-0000-0000-0000-000000000003', 'pixel-perfect', 'Pixel Perfect', 'Measure anything on the page',
   'Inspect spacing, colours and fonts with pixel-level rulers and a built-in contrast checker.',
   'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', null, 210000, 'paid', false, 'archived'),

  ('f0000000-0000-0000-0000-000000000004', 'devscope', 'DevScope', 'A debugger that lives in your toolbar',
   'Inspect network calls, edit localStorage and preview APIs without leaving the page you are on.',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', null, 540000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000005', 'copilot-canvas', 'Copilot Canvas', 'Your AI writing sidekick',
   'Rewrite, summarise and translate any text box on the web with a single click. Bring your own model.',
   'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000002', null, 890000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000006', 'cartwatch', 'CartWatch', 'Never overpay again',
   'Automatic coupon hunting plus price-drop alerts across hundreds of stores.',
   'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000002', null, 1600000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000007', 'focus-flow', 'Focus Flow', 'Reclaim your attention',
   'Time-box distracting sites, silence notifications and enter deep-work mode on schedule.',
   'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000002', null, 320000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000008', 'markdown-anywhere', 'Markdown Anywhere', 'Write in Markdown everywhere',
   'Turn any textarea into a Markdown editor with live preview and one-click export.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', null, 150000, 'free', false, 'archived'),

  ('f0000000-0000-0000-0000-000000000009', 'color-pickr', 'Color Pickr', 'Grab colours from any pixel',
   'Eyedrop colours from images, videos and the page, then export palettes in one click.',
   'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', null, 98000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000010', 'vaultpass', 'VaultPass', 'Zero-knowledge password autofill',
   'Generate, store and autofill strong passkeys with end-to-end encryption.',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000004', null, 2100000, 'paid', false, 'published'),

  ('f0000000-0000-0000-0000-000000000011', 'react-developer-tools', 'React Developer Tools', 'Inspect React components and their props',
   'Adds a React panel to the browser dev tools for inspecting component trees, editing props and state live, and profiling re-renders.',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000005', 'https://react.dev/learn/react-developer-tools', 4000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000012', 'requestly', 'Requestly', 'Modify HTTP requests and responses',
   'Redirect URLs, override headers and mock API responses without a proxy, so edge cases can be tested on the real site.',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000006', 'https://requestly.com', 350000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000013', 'axe-devtools', 'axe DevTools', 'Accessibility issues, caught early',
   'Scans any page for WCAG accessibility issues and suggests fixes, straight from a panel in your developer tools.',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000007', 'https://www.deque.com/axe/devtools/', 750000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000014', 'cookie-editor', 'Cookie-Editor', 'View, edit and manage browser cookies',
   'Lists every cookie set for the current site and lets you add, edit, delete, import or export them in one click.',
   'c0000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000008', 'https://cookie-editor.com', 1900000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000015', 'google-keep', 'Google Keep', 'Save quick notes, ideas and reminders',
   'Clips the page you are on into a Keep note, then keeps notes, lists and reminders in sync across your devices.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000009', 'https://keep.google.com', 3000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000016', 'onetab', 'OneTab', 'Turn open tabs into a manageable list',
   'Collapses every open tab into one restorable list, freeing memory and keeping sessions tidy.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000010', 'https://www.one-tab.com', 2000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000017', 'todoist', 'Todoist', 'Capture tasks and manage to-do lists',
   'Adds the current page as a task, plans your day and syncs projects across every device.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000011', 'https://todoist.com', 1100000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000018', 'notion-web-clipper', 'Notion Web Clipper', 'Save web pages directly to Notion',
   'Sends the page you are reading to any Notion database or page, keeping the title, URL and highlights.',
   'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000012', 'https://www.notion.com/web-clipper', 1400000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000019', 'bitwarden', 'Bitwarden', 'Stores and manages passwords securely',
   'Keeps logins in an end-to-end encrypted vault, generates strong passwords and autofills them with passkeys.',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000013', 'https://bitwarden.com', 1500000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000020', 'ublock-origin-lite', 'uBlock Origin Lite', 'Blocks advertisements and unwanted content',
   'Filters ads, pop-ups and tracking elements with declarative rule lists that need no broad page access.',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000014', 'https://github.com/uBlockOrigin/uBOL-home', 2600000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000021', 'adguard', 'AdGuard', 'Blocks ads, pop-ups and tracking elements',
   'Filters ads, pop-ups and trackers, cleans up leftover page elements and adds optional parental control.',
   'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000015', 'https://adguard.com', 1200000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000022', 'monica', 'Monica', 'AI assistant for writing, research and summarisation',
   'Chats about the page you are on, drafts and summarises text and answers research questions from a side panel.',
   'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000016', 'https://monica.im', 900000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000023', 'sider', 'Sider', 'Provides AI assistance while browsing websites',
   'Sidebar assistant that explains pages, translates selections and answers questions about what you are reading.',
   'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000017', 'https://sider.ai', 1200000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000024', 'merlin', 'Merlin', 'Helps with AI-powered writing and summarisation',
   'Summarises long pages, drafts replies and answers prompts with your preferred model from any site.',
   'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000018', 'https://www.getmerlin.in', 700000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000025', 'harpa-ai', 'HARPA AI', 'Combines AI assistance with browser automation',
   'Runs AI commands, monitors pages and automates repetitive browsing tasks with saved workflows.',
   'c0000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000019', 'https://harpa.ai', 800000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000026', 'perfectpixel', 'PerfectPixel', 'Compares website layouts against design mockups',
   'Overlays a design mockup on the live page with transparency control so pixels can be compared directly.',
   'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000020', 'https://www.welldonecode.com', 600000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000027', 'muzli', 'Muzli', 'Provides design inspiration and creative resources',
   'Replaces the new tab with a curated feed of design inspiration, UI patterns and creative finds.',
   'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000021', 'https://muz.li', 300000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000028', 'colorzilla', 'ColorZilla', 'Picks colours from websites and identifies colour codes',
   'Eyedrops any pixel on the page and copies the value as HEX, RGB or HSL, with a built-in palette history.',
   'c0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000022', 'https://www.colorzilla.com', 3000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000029', 'capital-one-shopping', 'Capital One Shopping', 'Compares prices and searches for better deals',
   'Checks other retailers for the same item and applies available coupon codes at checkout.',
   'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000023', 'https://capitaloneshopping.com', 5000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000030', 'keepa', 'Keepa', 'Tracks Amazon product prices over time',
   'Adds price history charts and price-drop alerts directly to Amazon product pages.',
   'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000024', 'https://keepa.com', 1500000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000031', 'coupert', 'Coupert', 'Finds coupon codes and cashback offers',
   'Tests coupon codes at checkout automatically and stacks cashback offers from partner stores.',
   'c0000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000025', 'https://www.coupert.com', 2000000, 'free', false, 'published'),

  ('f0000000-0000-0000-0000-000000000032', 'buffer', 'Buffer', 'Helps schedule and manage social media posts',
   'Queues posts from any page, schedules them across connected channels and tracks what performs best.',
   'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000026', 'https://buffer.com', 300000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000033', 'hunter', 'Hunter', 'Finds professional email addresses associated with websites',
   'Shows the public email addresses and contacts linked to the site you are visiting.',
   'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000027', 'https://hunter.io', 700000, 'freemium', false, 'published'),

  ('f0000000-0000-0000-0000-000000000034', 'seoquake', 'SEOquake', 'Provides SEO metrics and website analysis',
   'Adds on-page SEO audits, keyword density and authority metrics to any search result or site.',
   'c0000000-0000-0000-0000-000000000007', 'd0000000-0000-0000-0000-000000000028', 'https://www.semrush.com', 900000, 'free', false, 'published')
on conflict (id) do update
  set slug = excluded.slug, name = excluded.name, tagline = excluded.tagline,
      description = excluded.description, category_id = excluded.category_id,
      author_id = excluded.author_id, website_url = excluded.website_url,
      download_count = excluded.download_count,
      pricing = excluded.pricing,
      is_featured = excluded.is_featured, status = excluded.status;

-- ---------------------------------------------------------------------------
-- Extension <-> Browser relationships
-- ---------------------------------------------------------------------------
insert into public.extension_browsers (extension_id, browser_id) values
  -- velocity-tabs: chrome, edge, opera
  ('f0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000001','b0000000-0000-0000-0000-000000000005'),
  -- shieldlock: chrome, firefox, edge, safari
  ('f0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000002','b0000000-0000-0000-0000-000000000004'),
  -- pixel-perfect: chrome, firefox
  ('f0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000003','b0000000-0000-0000-0000-000000000002'),
  -- devscope: chrome, edge, firefox
  ('f0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000004','b0000000-0000-0000-0000-000000000002'),
  -- copilot-canvas: chrome, edge
  ('f0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000005','b0000000-0000-0000-0000-000000000003'),
  -- cartwatch: chrome, firefox, edge, opera
  ('f0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000006','b0000000-0000-0000-0000-000000000005'),
  -- focus-flow: chrome, firefox, safari
  ('f0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000007','b0000000-0000-0000-0000-000000000004'),
  -- markdown-anywhere: all
  ('f0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000004'),
  ('f0000000-0000-0000-0000-000000000008','b0000000-0000-0000-0000-000000000005'),
  -- color-pickr: chrome, edge
  ('f0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000009','b0000000-0000-0000-0000-000000000003'),
  -- vaultpass: all
  ('f0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000004'),
  ('f0000000-0000-0000-0000-000000000010','b0000000-0000-0000-0000-000000000005'),
  -- react-developer-tools: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000011','b0000000-0000-0000-0000-000000000003'),
  -- requestly: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000012','b0000000-0000-0000-0000-000000000003'),
  -- axe-devtools: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000013','b0000000-0000-0000-0000-000000000003'),
  -- cookie-editor: chrome, firefox, edge, opera
  ('f0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000014','b0000000-0000-0000-0000-000000000005'),
  -- google-keep: chrome, edge
  ('f0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000015','b0000000-0000-0000-0000-000000000003'),
  -- onetab: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000016','b0000000-0000-0000-0000-000000000003'),
  -- todoist: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000017','b0000000-0000-0000-0000-000000000003'),
  -- notion-web-clipper: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000018','b0000000-0000-0000-0000-000000000003'),
  -- bitwarden: chrome, firefox, edge, safari
  ('f0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000019','b0000000-0000-0000-0000-000000000004'),
  -- ublock-origin-lite: chrome, edge
  ('f0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000020','b0000000-0000-0000-0000-000000000003'),
  -- adguard: chrome, firefox, edge, safari
  ('f0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000021','b0000000-0000-0000-0000-000000000004'),
  -- monica: chrome, edge
  ('f0000000-0000-0000-0000-000000000022','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000022','b0000000-0000-0000-0000-000000000003'),
  -- sider: chrome, edge
  ('f0000000-0000-0000-0000-000000000023','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000023','b0000000-0000-0000-0000-000000000003'),
  -- merlin: chrome, edge
  ('f0000000-0000-0000-0000-000000000024','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000024','b0000000-0000-0000-0000-000000000003'),
  -- harpa-ai: chrome, edge, firefox
  ('f0000000-0000-0000-0000-000000000025','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000025','b0000000-0000-0000-0000-000000000003'),
  ('f0000000-0000-0000-0000-000000000025','b0000000-0000-0000-0000-000000000002'),
  -- perfectpixel: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000026','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000026','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000026','b0000000-0000-0000-0000-000000000003'),
  -- muzli: chrome, edge
  ('f0000000-0000-0000-0000-000000000027','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000027','b0000000-0000-0000-0000-000000000003'),
  -- colorzilla: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000028','b0000000-0000-0000-0000-000000000003'),
  -- capital-one-shopping: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000029','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000029','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000029','b0000000-0000-0000-0000-000000000003'),
  -- keepa: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000030','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000030','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000030','b0000000-0000-0000-0000-000000000003'),
  -- coupert: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000031','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000031','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000031','b0000000-0000-0000-0000-000000000003'),
  -- buffer: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000032','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000032','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000032','b0000000-0000-0000-0000-000000000003'),
  -- hunter: chrome, edge
  ('f0000000-0000-0000-0000-000000000033','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000033','b0000000-0000-0000-0000-000000000003'),
  -- seoquake: chrome, firefox, edge
  ('f0000000-0000-0000-0000-000000000034','b0000000-0000-0000-0000-000000000001'),
  ('f0000000-0000-0000-0000-000000000034','b0000000-0000-0000-0000-000000000002'),
  ('f0000000-0000-0000-0000-000000000034','b0000000-0000-0000-0000-000000000003')
on conflict (extension_id, browser_id) do nothing;

-- ---------------------------------------------------------------------------
-- Extension <-> Tag relationships (a couple of examples)
-- ---------------------------------------------------------------------------
insert into public.extension_tags (extension_id, tag_id) values
  ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000002'), -- velocity-tabs: tabs
  ('f0000000-0000-0000-0000-000000000001','e0000000-0000-0000-0000-000000000004'), -- velocity-tabs: productivity
  ('f0000000-0000-0000-0000-000000000002','e0000000-0000-0000-0000-000000000001'), -- shieldlock: privacy
  ('f0000000-0000-0000-0000-000000000005','e0000000-0000-0000-0000-000000000003')  -- copilot-canvas: ai
on conflict (extension_id, tag_id) do nothing;
