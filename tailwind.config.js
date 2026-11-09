/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  // Phones report :hover as "stuck" after a tap, which left cards/buttons in
  // their hover state. Gate every `hover:` utility behind a hover-capable
  // pointer so touch devices only get tap/active feedback.
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    // Tailwind only emits `container.padding` steps for the screens listed
    // below — with a single 1400px cap that means no responsive padding, so
    // the xs/sm/lg side padding is applied by the Container component.
    container: {
      center: true,
      padding: '0.875rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      screens: {
        // Extra-small phones (iPhone SE / Galaxy Mini class). Appended to the
        // default sm/md/lg/xl breakpoints rather than replacing them.
        xs: '480px',
      },
      colors: {
        // Semantic design tokens mapped to CSS variables (see index.css)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 4px)',
        sm: 'calc(var(--radius) - 8px)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [],
}
