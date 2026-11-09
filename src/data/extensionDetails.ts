import type {
  ExtensionFeature,
  ExtensionPermission,
  InstallLink,
  Review,
  BrowserSupport,
} from '@/types'

/**
 * Detail-only mock data for the extension cards in `src/data/extensions.ts`.
 * Kept in a separate module so the Explore page's light list rendering doesn't
 * have to carry features/permissions/reviews through every query.
 */
export interface ExtensionDetail {
  features: ExtensionFeature[]
  permissions: ExtensionPermission[]
  installLinks: InstallLink[]
  reviews: Review[]
}

/* ---------------- Install URL helper ------------------------------------- */

const INSTALL_URLS: Record<BrowserSupport, (slug: string) => string> = {
  chrome: (s) => `https://chromewebstore.google.com/detail/${s}`,
  firefox: (s) => `https://addons.mozilla.org/firefox/addon/${s}/`,
  edge: (s) => `https://microsoftedge.microsoft.com/addons/detail/${s}`,
  safari: (s) => `https://apps.apple.com/safari/app/${s}`,
  opera: (s) => `https://addons.opera.com/en/extensions/details/${s}/`,
}

function makeInstallLinks(
  slug: string,
  browsers: BrowserSupport[],
): InstallLink[] {
  return browsers
    .filter((b) => INSTALL_URLS[b])
    .map((b) => ({ browser: b, url: INSTALL_URLS[b](slug) }))
}

/* ---------------- Detail records ----------------------------------------- */

export const extensionDetails: Record<string, ExtensionDetail> = {
  'velocity-tabs': {
    features: [
      { title: 'Fuzzy tab search', description: 'Reach any open tab in under a second.' },
      { title: 'Session save & restore', description: 'Snapshot every window as a named session.' },
      { title: 'Auto-suspend idle tabs', description: 'Reclaim RAM from tabs you are not looking at.' },
      { title: 'Keyboard-first', description: 'Vim-like bindings for switching, closing and grouping.' },
    ],
    permissions: [
      { label: 'Read browsing history', description: 'Used to power fuzzy tab search and recency ordering.' },
      { label: 'Access tab information', description: 'Required to suspend and restore tabs.' },
      { label: 'Storage (local)', description: 'Persists sessions and preferences on your device.' },
    ],
    installLinks: makeInstallLinks('velocity-tabs', ['chrome', 'edge', 'opera']),
    reviews: [
      {
        id: 'r-velocity-1',
        authorName: 'Mika L.',
        rating: 5,
        title: 'Replaced my tab manager',
        body: 'I run 100+ tabs daily and Velocity Tabs is the first thing that made that actually manageable. Search is instant.',
        createdAt: '2026-08-12T00:00:00.000Z',
      },
      {
        id: 'r-velocity-2',
        authorName: 'Priya R.',
        rating: 4,
        title: 'Great, small learning curve',
        body: 'Keyboard shortcuts took a week to stick, but now I never touch the mouse to switch tabs.',
        createdAt: '2026-06-02T00:00:00.000Z',
      },
    ],
  },
  devscope: {
    features: [
      { title: 'Inline network inspector' },
      { title: 'localStorage editor' },
      { title: 'API preview panel' },
    ],
    permissions: [
      { label: 'Read tab data', description: 'Needed to attach the network inspector.' },
      { label: 'Modify storage', description: 'Enables the localStorage editor.' },
    ],
    installLinks: makeInstallLinks('devscope', ['chrome', 'edge', 'firefox']),
    reviews: [
      {
        id: 'r-dev-1',
        authorName: 'Ilya M.',
        rating: 4,
        body: 'The storage editor alone is worth it. Would like a request replay feature next.',
        createdAt: '2026-05-04T00:00:00.000Z',
      },
    ],
  },
  'react-developer-tools': {
    features: [
      { title: 'Component tree inspection' },
      { title: 'Live props, state and hooks editor' },
      { title: 'Profiler for re-render hot spots' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Required to attach the React panel to pages built with React.',
      },
      {
        label: 'Developer tools access',
        description: 'Adds the React tabs to the browser developer tools.',
      },
    ],
    installLinks: makeInstallLinks('react-developer-tools', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-react-1',
        authorName: 'Owen G.',
        rating: 5,
        title: 'Still the first install I do',
        body: 'The component tree and hooks view make debugging a React app in production builds far less painful.',
        createdAt: '2026-09-08T00:00:00.000Z',
      },
    ],
  },
  requestly: {
    features: [
      { title: 'Redirect, rewrite and block rules' },
      { title: 'Mock API responses' },
      { title: 'Header overrides' },
      { title: 'Shareable rule groups' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Needed to intercept and rewrite network requests.',
      },
      { label: 'Storage (sync)', description: 'Keeps your rules across signed-in devices.' },
    ],
    installLinks: makeInstallLinks('requestly', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-requestly-1',
        authorName: 'Hana T.',
        rating: 4,
        title: 'Replaced a local proxy setup',
        body: 'Redirecting staged assets onto production pages without a proxy is the killer feature for me.',
        createdAt: '2026-09-24T00:00:00.000Z',
      },
    ],
  },
  'axe-devtools': {
    features: [
      { title: 'Automated WCAG scans' },
      { title: 'Guided remediation steps' },
      { title: 'Keyboard and contrast checks' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Runs the audit against the page you are inspecting.',
      },
    ],
    installLinks: makeInstallLinks('axe-devtools', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-axe-1',
        authorName: 'Marta C.',
        rating: 5,
        title: 'Caught issues QA never would',
        body: 'The guided fixes are what make it useful. A rule name alone would have taken me an hour to act on.',
        createdAt: '2026-10-11T00:00:00.000Z',
      },
    ],
  },
  'cookie-editor': {
    features: [
      { title: 'Per-site cookie list' },
      { title: 'Add, edit and delete in place' },
      { title: 'Import and export (JSON)' },
      { title: 'Search and filter' },
    ],
    permissions: [
      { label: 'Read cookies', description: 'Lists the cookies set for the current site.' },
      {
        label: 'Modify cookies',
        description: 'Enables editing, deleting and importing cookies.',
      },
    ],
    installLinks: makeInstallLinks('cookie-editor', ['chrome', 'firefox', 'edge', 'opera']),
    reviews: [
      {
        id: 'r-cookie-1',
        authorName: 'Dex W.',
        rating: 5,
        body: 'Export/import of cookies between environments saved me from recreating a session by hand.',
        createdAt: '2026-08-02T00:00:00.000Z',
      },
    ],
  },
  'google-keep': {
    features: [
      { title: 'One-click page clipping' },
      { title: 'Notes, lists and reminders' },
      { title: 'Sync across signed-in devices' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Used to clip the page you are on into a note.',
      },
      {
        label: 'Google account access',
        description: 'Keeps notes in sync with your Keep account.',
      },
    ],
    installLinks: makeInstallLinks('google-keep', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-keep-1',
        authorName: 'Ada P.',
        rating: 5,
        title: 'Fastest way to jot something down',
        body: 'Clipping a page into Keep takes one click, and the reminders show up on my phone straight away.',
        createdAt: '2026-09-19T00:00:00.000Z',
      },
    ],
  },
  onetab: {
    features: [
      { title: 'Collapse all tabs into one list' },
      { title: 'Restore one tab or everything' },
      { title: 'Share a tab list as a link' },
      { title: 'Cuts memory use straight away' },
    ],
    permissions: [
      {
        label: 'Access tab information',
        description: 'Required to collapse and restore your open tabs.',
      },
      { label: 'Storage (local)', description: 'Keeps saved tab lists on your device.' },
    ],
    installLinks: makeInstallLinks('onetab', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-onetab-1',
        authorName: 'Bezim T.',
        rating: 4,
        title: 'Saved my laptop',
        body: 'Two hundred tabs became one list and the fan finally went quiet. Restoring a single tab is a bit fiddly.',
        createdAt: '2026-07-11T00:00:00.000Z',
      },
    ],
  },
  todoist: {
    features: [
      { title: 'Add the current page as a task' },
      { title: 'Quick add with due dates' },
      { title: 'Today and project views' },
    ],
    permissions: [
      { label: 'Read the current page', description: 'Only read when you add the page as a task.' },
      { label: 'Storage (sync)', description: 'Syncs tasks with your Todoist account.' },
    ],
    installLinks: makeInstallLinks('todoist', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-todoist-1',
        authorName: 'Selin K.',
        rating: 5,
        title: 'Inbox zero, finally',
        body: 'Adding a page as a task from the toolbar is the whole reason I stopped using bookmarks.',
        createdAt: '2026-10-05T00:00:00.000Z',
      },
    ],
  },
  'notion-web-clipper': {
    features: [
      { title: 'Save pages to any Notion database' },
      { title: 'Keeps title, URL and highlights' },
      { title: 'Works with team workspaces' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Captures the page title, URL and selected text.',
      },
      {
        label: 'Notion workspace access',
        description: 'Writes the clip into the destination you choose.',
      },
    ],
    installLinks: makeInstallLinks('notion-web-clipper', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-notion-1',
        authorName: 'Ravi D.',
        rating: 4,
        body: 'Works well with databases. I would like a default destination per site.',
        createdAt: '2026-08-16T00:00:00.000Z',
      },
    ],
  },
  bitwarden: {
    features: [
      { title: 'End-to-end encrypted vault' },
      { title: 'Autofill and password generator' },
      { title: 'Passkey support' },
      { title: 'Open-source and independently audited' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Required to fill credentials on sign-in forms.',
      },
      { label: 'Storage (sync)', description: 'Syncs your encrypted vault across signed-in devices.' },
    ],
    installLinks: makeInstallLinks('bitwarden', ['chrome', 'firefox', 'edge', 'safari']),
    reviews: [
      {
        id: 'r-bitwarden-1',
        authorName: 'Tomasz B.',
        rating: 5,
        title: 'Free tier is genuinely enough',
        body: 'Passkey autofill works on every site I use daily, and the open-source audit trail is why I switched.',
        createdAt: '2026-09-27T00:00:00.000Z',
      },
    ],
  },
  'ublock-origin-lite': {
    features: [
      { title: 'Blocks ads, trackers and pop-ups' },
      { title: 'Declarative filtering rules' },
      { title: 'Per-site strictness levels' },
    ],
    permissions: [
      {
        label: 'Block content on allowed sites',
        description: 'Applied through declarative rules instead of reading page content.',
      },
      { label: 'Storage (local)', description: 'Keeps your filter settings on your device.' },
    ],
    installLinks: makeInstallLinks('ublock-origin-lite', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-ubol-1',
        authorName: 'Nadia S.',
        rating: 4,
        title: 'Clean pages, no fuss',
        body: 'Default settings already kill most ads. A few strict sites needed a manual level bump.',
        createdAt: '2026-10-14T00:00:00.000Z',
      },
    ],
  },
  adguard: {
    features: [
      { title: 'Ad, pop-up and tracker filtering' },
      { title: 'Cosmetic filtering of page elements' },
      { title: 'Optional parental control and safe search' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Needed to hide ads and block tracking requests.',
      },
      { label: 'Storage (sync)', description: 'Keeps your filter settings across devices.' },
    ],
    installLinks: makeInstallLinks('adguard', ['chrome', 'firefox', 'edge', 'safari']),
    reviews: [
      {
        id: 'r-adguard-1',
        authorName: 'Jorge A.',
        rating: 5,
        title: 'Best at cosmetic cleanup',
        body: 'It removes the empty ad boxes too, so layouts no longer jump around while loading.',
        createdAt: '2026-08-19T00:00:00.000Z',
      },
    ],
  },
  monica: {
    features: [
      { title: 'Chat about the current page' },
      { title: 'Drafting and summarising' },
      { title: 'Research with citations' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Lets the assistant answer questions about the page you are on.',
      },
      {
        label: 'Network access to your AI provider',
        description: 'Sends prompts to the model you select.',
      },
    ],
    installLinks: makeInstallLinks('monica', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-monica-1',
        authorName: 'Yuki N.',
        rating: 5,
        title: 'One assistant for every tab',
        body: 'Asking questions about the page without copying text into another app is the whole win for me.',
        createdAt: '2026-09-30T00:00:00.000Z',
      },
    ],
  },
  sider: {
    features: [
      { title: 'Sidebar chat on any site' },
      { title: 'Explain and translate selections' },
      { title: 'Summarise articles and PDFs' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Required for page summaries and explanations.',
      },
      {
        label: 'Network access to your AI provider',
        description: 'Only used when you send a prompt.',
      },
    ],
    installLinks: makeInstallLinks('sider', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-sider-1',
        authorName: 'Piotr L.',
        rating: 4,
        title: 'Handy sidebar, slightly chatty',
        body: 'Page summaries are accurate. I turned off proactive suggestions because they popped up too often.',
        createdAt: '2026-10-08T00:00:00.000Z',
      },
    ],
  },
  merlin: {
    features: [
      { title: 'Summarise long pages' },
      { title: 'Draft replies and emails' },
      { title: 'Bring your own model' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Used when you ask for a summary or draft.',
      },
      { label: 'Storage (local)', description: 'Keeps your prompt history on your device.' },
    ],
    installLinks: makeInstallLinks('merlin', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-merlin-1',
        authorName: 'Rosa M.',
        rating: 4,
        title: 'Reliable for quick drafts',
        body: 'Drafting replies from the toolbar saves me a lot of typing on long threads.',
        createdAt: '2026-07-22T00:00:00.000Z',
      },
    ],
  },
  'harpa-ai': {
    features: [
      { title: 'AI commands and prompts' },
      { title: 'Page monitoring and change alerts' },
      { title: 'Saved automation workflows' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Needed to run automations on pages you choose.',
      },
      {
        label: 'Network access to your AI provider',
        description: 'Sends commands to the model you configure.',
      },
    ],
    installLinks: makeInstallLinks('harpa-ai', ['chrome', 'edge', 'firefox']),
    reviews: [
      {
        id: 'r-harpa-ai-1',
        authorName: 'Ken I.',
        rating: 5,
        title: 'Automation is the differentiator',
        body: 'Saved workflows that watch a page and alert me only when something changes have replaced two other tools.',
        createdAt: '2026-10-19T00:00:00.000Z',
      },
    ],
  },
  perfectpixel: {
    features: [
      { title: 'Mockup overlay with opacity control' },
      { title: 'Pixel-level comparison' },
      { title: 'Works on responsive layouts' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Only used to draw the mockup overlay on the page.',
      },
    ],
    installLinks: makeInstallLinks('perfectpixel', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-perfectpixel-1',
        authorName: 'Lena F.',
        rating: 5,
        title: 'Mockup overlay saved my QA',
        body: 'Dropping the design straight onto the build and sliding the opacity makes off-by-two-pixel bugs obvious.',
        createdAt: '2026-09-12T00:00:00.000Z',
      },
    ],
  },
  muzli: {
    features: [
      { title: 'Curated inspiration feed' },
      { title: 'UI and colour pattern collections' },
      { title: 'Replaces the new tab page' },
    ],
    permissions: [
      {
        label: 'Replace the new tab page',
        description: 'Needed to show the inspiration feed instead of a blank tab.',
      },
      { label: 'Storage (local)', description: 'Remembers saved items and preferences.' },
    ],
    installLinks: makeInstallLinks('muzli', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-muzli-1',
        authorName: 'Omar Z.',
        rating: 4,
        title: 'Good daily inspiration',
        body: 'Good inspiration feed. I would like more mobile app UI examples.',
        createdAt: '2026-08-27T00:00:00.000Z',
      },
    ],
  },
  colorzilla: {
    features: [
      { title: 'Eyedropper on any pixel' },
      { title: 'HEX, RGB and HSL output' },
      { title: 'Palette history' },
    ],
    permissions: [
      {
        label: 'Read and change all your data on websites',
        description: 'Only used to sample colours from the current page.',
      },
    ],
    installLinks: makeInstallLinks('colorzilla', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-colorzilla-1',
        authorName: 'Iris H.',
        rating: 5,
        title: 'Still the fastest picker',
        body: 'Eyedropper plus the copy as HEX shortcut is muscle memory for me now.',
        createdAt: '2026-09-05T00:00:00.000Z',
      },
    ],
  },
  'capital-one-shopping': {
    features: [
      { title: 'Price comparison across retailers' },
      { title: 'Automatic coupon testing' },
      { title: 'Wishlist price alerts' },
    ],
    permissions: [
      {
        label: 'Read shopping site data',
        description: 'Only on supported retailers, when a product page loads.',
      },
      {
        label: 'Storage (sync)',
        description: 'Keeps your watchlist across signed-in devices.',
      },
    ],
    installLinks: makeInstallLinks('capital-one-shopping', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-capital-one-shopping-1',
        authorName: 'Dana W.',
        rating: 4,
        title: 'Found cheaper alternatives',
        body: 'It surfaced the same item at two other retailers for less. Coupon testing is hit and miss.',
        createdAt: '2026-10-02T00:00:00.000Z',
      },
    ],
  },
  keepa: {
    features: [
      { title: 'Price history charts' },
      { title: 'Price-drop alerts' },
      { title: 'Deal score grading' },
    ],
    permissions: [
      {
        label: 'Read Amazon product pages',
        description: 'Used to embed the price history chart.',
      },
      { label: 'Storage (sync)', description: 'Keeps your tracked products in sync.' },
    ],
    installLinks: makeInstallLinks('keepa', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-keepa-1',
        authorName: 'Victor S.',
        rating: 5,
        title: 'Price history is invaluable',
        body: 'The chart told me a sale price was nothing special, so I waited and saved 30 dollars.',
        createdAt: '2026-08-09T00:00:00.000Z',
      },
    ],
  },
  coupert: {
    features: [
      { title: 'Automatic coupon testing' },
      { title: 'Cashback offers' },
      { title: 'Checkout price alerts' },
    ],
    permissions: [
      {
        label: 'Read shopping site data',
        description: 'Needed to find and apply coupons at checkout.',
      },
      { label: 'Storage (sync)', description: 'Tracks earned cashback in your account.' },
    ],
    installLinks: makeInstallLinks('coupert', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-coupert-1',
        authorName: 'Ana G.',
        rating: 4,
        title: 'Quiet and useful',
        body: 'Works quietly in the background and the cashback adds up, though payouts take a while.',
        createdAt: '2026-07-16T00:00:00.000Z',
      },
    ],
  },
  buffer: {
    features: [
      { title: 'Queue posts from any page' },
      { title: 'Multi-channel scheduling' },
      { title: 'Post performance insights' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Used to build a post from what you are viewing.',
      },
      { label: 'Storage (sync)', description: 'Syncs the queue with your Buffer account.' },
    ],
    installLinks: makeInstallLinks('buffer', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-buffer-1',
        authorName: 'Meera J.',
        rating: 5,
        title: 'Queue posts without tab hopping',
        body: 'Adding a link to the queue from any page keeps my week planned in minutes.',
        createdAt: '2026-09-23T00:00:00.000Z',
      },
    ],
  },
  hunter: {
    features: [
      { title: 'Email addresses for any site' },
      { title: 'Contact and role details' },
      { title: 'One-click email verification' },
    ],
    permissions: [
      {
        label: 'Read the current website address',
        description: 'Needed to look up contacts for the site you visit.',
      },
      { label: 'Storage (local)', description: 'Keeps your recent lookups on your device.' },
    ],
    installLinks: makeInstallLinks('hunter', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-hunter-1',
        authorName: 'Ellis V.',
        rating: 4,
        title: 'Great for outreach research',
        body: 'Contacts on company pages come up reliably. Verification credits run out quickly on the free plan.',
        createdAt: '2026-10-10T00:00:00.000Z',
      },
    ],
  },
  seoquake: {
    features: [
      { title: 'On-page SEO audit' },
      { title: 'Keyword and density analysis' },
      { title: 'Authority and traffic metrics' },
    ],
    permissions: [
      {
        label: 'Read the current page',
        description: 'Required to audit the page and its metadata.',
      },
      { label: 'Storage (local)', description: 'Remembers your panel preferences.' },
    ],
    installLinks: makeInstallLinks('seoquake', ['chrome', 'firefox', 'edge']),
    reviews: [
      {
        id: 'r-seoquake-1',
        authorName: 'Fabio R.',
        rating: 4,
        title: 'Fast on-page audit',
        body: 'The on-page audit catches missing meta descriptions instantly. Interface feels dated.',
        createdAt: '2026-08-31T00:00:00.000Z',
      },
    ],
  },
  'copilot-canvas': {
    features: [
      { title: 'Rewrite, translate, summarise' },
      { title: 'Bring your own model' },
      { title: 'Works in any textarea' },
    ],
    permissions: [
      { label: 'Read and change all your data on websites', description: 'Only reads textarea content on demand.' },
      { label: 'Network access (your API keys)', description: 'Sends selected text to your chosen model provider.' },
    ],
    installLinks: makeInstallLinks('copilot-canvas', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-copilot-1',
        authorName: 'Tomas F.',
        rating: 4,
        body: 'Featherweight, respects BYO model, and does not send anything without a click.',
        createdAt: '2026-08-28T00:00:00.000Z',
      },
    ],
  },
  cartwatch: {
    features: [
      { title: 'Automatic coupon hunting' },
      { title: 'Price-drop alerts' },
      { title: 'Wishlist tracking' },
    ],
    permissions: [
      { label: 'Read shopping site data', description: 'Only on supported stores, on demand.' },
      { label: 'Storage (sync)', description: 'Keeps your wishlist across signed-in devices.' },
    ],
    installLinks: makeInstallLinks('cartwatch', ['chrome', 'firefox', 'edge', 'opera']),
    reviews: [
      {
        id: 'r-cart-1',
        authorName: 'Bea V.',
        rating: 4,
        body: 'Saved me about $80 across two months. No-brainer install.',
        createdAt: '2026-07-30T00:00:00.000Z',
      },
    ],
  },
  'focus-flow': {
    features: [
      { title: 'Time-box distracting sites' },
      { title: 'Deep-work mode scheduling' },
      { title: 'Notification silencing' },
    ],
    permissions: [
      { label: 'Read browsing history', description: 'Matches sites against your block list.' },
    ],
    installLinks: makeInstallLinks('focus-flow', ['chrome', 'firefox', 'safari']),
    reviews: [
      {
        id: 'r-focus-1',
        authorName: 'Sam O.',
        rating: 5,
        title: 'Genuinely helped',
        body: 'The scheduling keeps my evenings off social media without me having to decide.',
        createdAt: '2026-09-15T00:00:00.000Z',
      },
    ],
  },
  'color-pickr': {
    features: [
      { title: 'Eyedropper over images, video and page' },
      { title: 'Palette export (CSS, JSON)' },
      { title: 'Copy as HEX / RGB / HSL' },
    ],
    permissions: [
      { label: 'Read and change all your data on websites', description: 'Only used to sample pixel colour from the current page.' },
    ],
    installLinks: makeInstallLinks('color-pickr', ['chrome', 'edge']),
    reviews: [
      {
        id: 'r-color-1',
        authorName: 'Kia N.',
        rating: 4,
        body: 'Simple and fast. Would love a colour-blind-safe palette suggestion mode.',
        createdAt: '2026-08-05T00:00:00.000Z',
      },
    ],
  },
  vaultpass: {
    features: [
      { title: 'Zero-knowledge passkey generation' },
      { title: 'End-to-end encrypted vault' },
      { title: 'Autofill with biometric unlock' },
    ],
    permissions: [
      { label: 'Read and change all your data on websites', description: 'Required to fill credentials on sign-in forms.' },
      { label: 'Native messaging', description: 'Communicates with the local VaultPass agent for encryption.' },
    ],
    installLinks: makeInstallLinks('vaultpass', ['chrome', 'firefox', 'edge', 'safari', 'opera']),
    reviews: [
      {
        id: 'r-vault-1',
        authorName: 'Nora S.',
        rating: 5,
        body: 'Migration from my old manager was one-click and everything was where I expected it.',
        createdAt: '2026-10-02T00:00:00.000Z',
      },
      {
        id: 'r-vault-2',
        authorName: 'Rob J.',
        rating: 4,
        title: 'Solid, occasional slow unlock',
        body: 'Rarely, biometric unlock takes a beat longer than I want. Everything else is spot-on.',
        createdAt: '2026-08-22T00:00:00.000Z',
      },
    ],
  },
}

/** Screenshot placeholder metadata (used only when Supabase isn't configured). */
export const screenshotCountBySlug: Record<string, number> = {
  'velocity-tabs': 3,
  devscope: 2,
  'react-developer-tools': 3,
  requestly: 2,
  'axe-devtools': 3,
  'cookie-editor': 2,
  'google-keep': 2,
  onetab: 3,
  todoist: 2,
  'notion-web-clipper': 3,
  bitwarden: 2,
  'ublock-origin-lite': 3,
  adguard: 2,
  'copilot-canvas': 3,
  cartwatch: 2,
  'focus-flow': 2,
  'color-pickr': 3,
  vaultpass: 2,
  monica: 3,
  sider: 2,
  merlin: 3,
  'harpa-ai': 2,
  perfectpixel: 3,
  muzli: 2,
  colorzilla: 3,
  'capital-one-shopping': 2,
  keepa: 3,
  coupert: 2,
  buffer: 3,
  hunter: 2,
  seoquake: 3,
}
