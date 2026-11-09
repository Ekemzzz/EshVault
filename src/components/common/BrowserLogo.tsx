import type { BrowserSupport } from '@/types'

interface BrowserLogoProps {
  browser: BrowserSupport
  className?: string
}

export function BrowserLogo({ browser, className }: BrowserLogoProps) {
  switch (browser) {
    case 'chrome':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="15" fill="#fbbc04" />
          <path d="M16 16 8.5 29A15 15 0 0 1 3 8.5h15.2A8.7 8.7 0 0 0 16 16Z" fill="#34a853" />
          <path d="M3 8.5A15 15 0 0 1 29 8H16a8.7 8.7 0 0 0-7.5 4.3Z" fill="#ea4335" />
          <circle cx="16" cy="16" r="7.2" fill="#fff" />
          <circle cx="16" cy="16" r="5.6" fill="#4285f4" />
        </svg>
      )
    case 'firefox':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path
            fill="#ff7139"
            d="M27.8 12.2c-.3-3.5-2.1-6-4.9-7.8.5 2.4-.2 4.1-1.6 5.2-.8-3.7-3.8-6.2-7.6-7.1 1.1 2.1 1 4.1-.2 5.8C10.8 7.3 8.1 7.1 5.5 8c1.2.6 2 1.5 2.3 2.7C4.3 13 3 16 3 19.3 3 25 7.7 29 14.6 29c7.7 0 13.4-4.8 13.4-11.2 0-2.1-.7-4-2-5.6.7.2 1.3.2 1.8 0Z"
          />
          <circle cx="16.5" cy="18.5" r="7" fill="#312e81" />
          <path d="M10 19.4a6.5 6.5 0 0 1 11.6-4.1 6.5 6.5 0 1 1-11.6 4.1Z" fill="#6d5dfc" />
        </svg>
      )
    case 'edge':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path
            fill="#00a8a8"
            d="M27.8 22.2c-1.7 4.2-6 6.8-11.7 6.8C8.7 29 3 24.4 3 17.5 3 10.4 8.8 4 16.7 4c7.2 0 12.1 5.1 12.1 12.2 0 .7 0 1.4-.2 2H10.2c.6 3.2 3.1 5.1 6.6 5.1 2.8 0 4.8-1 6.2-3l4.8 1.9ZM10.4 14h12c-.5-3-2.5-4.7-5.7-4.7-3.2 0-5.5 1.8-6.3 4.7Z"
          />
          <path d="M10 20.2c1.4 1.9 3.7 2.9 6.8 2.9 2.7 0 4.8-.9 6.2-2.8-1.5 4.1-5.2 6.4-10 6.4-3.8 0-6.9-1.6-8.6-4.4 1.4-.9 3.4-1.6 5.6-2.1Z" fill="#0877bd" />
        </svg>
      )
    case 'safari':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <circle cx="16" cy="16" r="14.5" fill="#eaf4ff" stroke="#61a9e8" strokeWidth="2" />
          <path d="m20.8 10.2-3.6 8.1-6 3.5 3.6-8.1 6-3.5Z" fill="#f04452" />
          <path d="m11.2 21.8 3.6-8.1 6-3.5-3.6 8.1-6 3.5Z" fill="#2088df" />
          <circle cx="16" cy="16" r="1.2" fill="#fff" />
        </svg>
      )
    case 'opera':
      return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
          <path
            fill="#f21b3f"
            d="M16 2.5C8.3 2.5 3 8 3 16s5.3 13.5 13 13.5S29 24 29 16 23.7 2.5 16 2.5Zm0 5.2c3.5 0 5.7 3.1 5.7 8.3s-2.2 8.3-5.7 8.3-5.7-3.1-5.7-8.3 2.2-8.3 5.7-8.3Z"
          />
        </svg>
      )
  }
}
