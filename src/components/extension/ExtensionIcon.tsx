import { gradientForSlug, initialsForName } from '@/data/extensions'
import { cn } from '@/utils/cn'

type Size = 'sm' | 'md' | 'lg'

const sizeStyles: Record<Size, string> = {
  sm: 'h-9 w-9 rounded-lg text-xs',
  md: 'h-12 w-12 rounded-xl text-sm',
  lg: 'h-14 w-14 rounded-xl text-base',
}

const localIconOverrides: Partial<Record<string, string>> = {
  'capital-one-shopping': '/extension-logos/capital-one-shopping.png',
  'react-developer-tools': '/extension-logos/react-developer-tools.png',
  colorzilla: '/extension-logos/colorzilla.png',
  'google-keep': '/extension-logos/google-keep.png',
  'ublock-origin-lite': '/extension-logos/ublock-origin-lite.png',
  vaultpass: '/extension-logos/vaultpass.png',
  coupert: '/extension-logos/coupert.png',
  onetab: '/extension-logos/onetab.png',
  'cookie-editor': '/extension-logos/cookie-editor.png',
  keepa: '/extension-logos/keepa.png',
  'velocity-tabs': '/extension-logos/velocity-tabs.png',
  cartwatch: '/extension-logos/cartwatch.webp',
  bitwarden: '/extension-logos/bitwarden.png',
  'notion-web-clipper': '/extension-logos/notion-web-clipper.png',
  adguard: '/extension-logos/adguard.png',
  sider: '/extension-logos/sider.jpg',
  todoist: '/extension-logos/todoist.png',
  monica: '/extension-logos/monica.png',
  seoquake: '/extension-logos/seoquake.png',
  'copilot-canvas': '/extension-logos/copilot-canvas.png',
  'harpa-ai': '/extension-logos/harpa-ai.png',
  'axe-devtools': '/extension-logos/axe-devtools.png',
  merlin: '/extension-logos/merlin.png',
  hunter: '/extension-logos/hunter.png',
  perfectpixel: '/extension-logos/perfectpixel.png',
  devscope: '/extension-logos/devscope.png',
  requestly: '/extension-logos/requestly.png',
  'focus-flow': '/extension-logos/focus-flow.png',
  muzli: '/extension-logos/muzli.png',
  buffer: '/extension-logos/buffer.png',
  'color-pickr': '/extension-logos/color-picker.png',
}

interface ExtensionIconProps {
  name: string
  slug: string
  iconUrl?: string
  size?: Size
  className?: string
}

//
//   Square app-tile for an extension. Uses the real icon when available,
//   otherwise a deterministic gradient + initials fallback.
//  
export function ExtensionIcon({ name, slug, iconUrl, size = 'md', className }: ExtensionIconProps) {
  const resolvedIconUrl = localIconOverrides[slug] ?? iconUrl

  if (resolvedIconUrl) {
    return (
      <img
        src={resolvedIconUrl}
        alt=""
        className={cn(
          'object-contain',
          slug === 'vaultpass' ? 'bg-black' : 'bg-white',
          sizeStyles[size],
          className,
        )}
        loading="lazy"
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        'grid place-items-center bg-gradient-to-br font-bold text-white shadow-sm',
        gradientForSlug(slug),
        sizeStyles[size],
        className,
      )}
    >
      {initialsForName(name)}
    </span>
  )
}
