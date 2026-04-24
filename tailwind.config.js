/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    // Override the default spacing scale entirely — use the design system's scale
    // instead of Tailwind's defaults to keep spacing consistent with Figma.
    spacing: {
      0: '0px',
      25: '1px',
      50: '2px',
      100: '4px',
      200: '8px',
      300: '12px',
      400: '16px',
      500: '20px',
      600: '24px',
      700: '28px',
      800: '32px',
      900: '36px',
      1000: '40px',
      1100: '48px',
      1200: '56px',
      1300: '64px',
      1400: '72px',
      1500: '96px',
      1600: '128px',
      1700: '256px',
      1800: '512px',
      px: '1px',
    },
    // Font-size scale matching the Figma token typography.
    // NOTE: keys here MUST NOT collide with color names or the color utility
    // for that key won't generate. (`body` and `caption` colors live at root
    // colors below — Tailwind will still emit size + color onto the same class.)
    fontSize: {
      // Headings — desktop
      h1: ['60px', { lineHeight: '72px' }],
      h2: ['48px', { lineHeight: '56px' }],
      h3: ['40px', { lineHeight: '48px' }],
      h4: ['32px', { lineHeight: '40px' }],
      h5: ['24px', { lineHeight: '28px' }],
      h6: ['20px', { lineHeight: '24px' }],
      // Headings — mobile
      'h1-mobile': ['48px', { lineHeight: '56px' }],
      'h2-mobile': ['40px', { lineHeight: '48px' }],
      'h3-mobile': ['32px', { lineHeight: '40px' }],
      'h4-mobile': ['28px', { lineHeight: '32px' }],
      'h5-mobile': ['24px', { lineHeight: '28px' }],
      'h6-mobile': ['20px', { lineHeight: '24px' }],
      // Copy
      'body-lg': ['20px', { lineHeight: '24px' }],
      body: ['16px', { lineHeight: '20px' }],
      'body-sm': ['14px', { lineHeight: '20px' }],
      caption: ['12px', { lineHeight: '16px' }],
    },
    extend: {
      // ──────────────────────────────────────────────────────────────────────
      // COLORS
      //
      // Tailwind generates utilities per color family. If a family is named
      // `text`, the `text-*` utility becomes `text-text-*` (recursive prefix)
      // and never resolves `text-heading`/`text-body`. To avoid that, semantic
      // foreground tokens live at the ROOT of `colors`. Scales (primary,
      // accent, success, warning, error, info) have a `DEFAULT` so
      // `text-primary`, `bg-accent`, etc. work without a suffix.
      //
      // Figma variable → Tailwind class mapping:
      //   --surface/page                        → bg-surface-page
      //   --surface/default                     → bg-surface
      //   --surface/secondary                   → bg-surface-secondary
      //   --surface/secondary-subtle            → bg-surface-secondary-subtle
      //   --surface/primary/default             → bg-surface-primary
      //   --surface/primary/hover               → bg-surface-primary-hover
      //   --surface/accent/default              → bg-surface-accent
      //   --surface/accent/default-subtle       → bg-surface-accent-subtle
      //   --surface/info/default-subtle         → bg-surface-info-subtle
      //   --text/default/headding               → text-heading
      //   --text/default/body-default           → text-body
      //   --text/default/body-emphasis          → text-body-emphasis
      //   --text/default/caption                → text-caption
      //   --text/default/placeholder            → text-placeholder
      //   --text/primary/default                → text-primary
      //   --text/primary/hover                  → text-primary-hover
      //   --text/accent/default                 → text-accent
      //   --border/default                      → border-default
      //   --border/default-subtle               → border-subtle
      //   (raw #E8E5E0 chrome border)           → border-control
      //   (raw #FBF2EB logo cream bg)           → bg-surface-brand-subtle
      // ──────────────────────────────────────────────────────────────────────
      colors: {
        // ─── Scales (with DEFAULTs so `text-primary`, `bg-accent` etc. work) ───
        primary: {
          DEFAULT: '#2C2524',
          100: '#D7D5D5',
          200: '#AFABAB',
          300: '#878281',
          400: '#5F5857',
          500: '#372E2D',
          600: '#2C2524',
          700: '#211C1B',
          800: '#161212',
          900: '#0B0909',
          hover: '#0B0909',
        },
        accent: {
          DEFAULT: '#62899B',
          100: '#E5EEF3',
          200: '#CADDE7',
          300: '#B0CDDA',
          400: '#95BCCE',
          500: '#7BABC2',
          600: '#62899B',
          700: '#4A6774',
          800: '#31444E',
          900: '#192227',
        },
        success: {
          DEFAULT: '#636F59',
          100: '#E5E8E2',
          200: '#CBD1C5',
          300: '#B0B9A9',
          400: '#96A28C',
          500: '#7C8B6F',
          600: '#636F59',
          700: '#4A5343',
          800: '#32382C',
          900: '#191C16',
        },
        warning: {
          DEFAULT: '#AD8252',
          100: '#F7EDE1',
          200: '#EFDAC2',
          300: '#E8C8A4',
          400: '#E0B585',
          500: '#D8A367',
          600: '#AD8252',
          700: '#82623E',
          800: '#564129',
          900: '#2B2115',
        },
        error: {
          DEFAULT: '#AD1D1D',
          100: '#EFD2D2',
          200: '#DEA5A5',
          300: '#CE7777',
          400: '#BD4A4A',
          500: '#AD1D1D',
          600: '#8A1717',
          700: '#681111',
          800: '#450C0C',
          900: '#230606',
        },
        info: {
          DEFAULT: '#62899B',
          100: '#E5EEF3',
          200: '#CADDE7',
          300: '#B0CDDA',
          400: '#95BCCE',
          500: '#7BABC2',
          600: '#62899B',
          700: '#4A6774',
          800: '#31444E',
          900: '#192227',
        },
        neutral: {
          0: '#FFFFFF',
          50: '#EBEAEA',
          100: '#D7D5D5',
          200: '#AFABAB',
          300: '#878281',
          400: '#5F5857',
          500: '#372E2D',
          600: '#2C2524',
          700: '#211C1B',
          800: '#161212',
          900: '#0B0909',
          1000: '#000000',
        },
        'neutral-alt': {
          25: '#FCFCFA',
          50: '#F7F6F3',
          75: '#F0EDE6',
          100: '#E2DBCF',
          200: '#C5B89F',
          300: '#A7946E',
          400: '#8A713E',
          500: '#6D4D0E',
          600: '#573E0B',
          700: '#412E08',
          800: '#2C1F06',
          900: '#160F03',
        },

        // ─── Semantic foreground/text colors (root level so `text-*` resolves) ───
        //
        // These names must NOT overlap with fontSize keys; when they do, Tailwind
        // emits one rule for the utility and the other meaning is lost. Use the
        // distinct names below for color, and the fontSize utilities (`text-body`,
        // `text-caption`, `text-body-sm`, `text-h4`…) for size.
        //
        // Figma color variable → Tailwind class:
        //   --text/default/body-default   → (inherit from body CSS; use `text-primary-400` if explicit)
        //   --text/default/body-emphasis  → text-body-emphasis
        //   --text/default/headding       → text-heading
        //   --text/default/caption        → text-muted (#878281)
        //   --text/default/placeholder    → text-placeholder
        //   --text/primary/default        → text-primary
        //   --text/accent/default         → text-accent
        //   white on colored bg           → text-on-color
        heading: '#372E2D',
        'body-emphasis': '#372E2D',
        muted: '#878281',               // caption text color (renamed from `caption` to avoid fontSize clash)
        placeholder: '#878281',
        disabled: '#AFABAB',
        'on-color': '#FFFFFF',
        secondary: '#878281',
        'secondary-hover': '#5F5857',

        // ─── Surfaces (nested — family name doesn't collide with a utility prefix) ───
        surface: {
          DEFAULT: '#FFFFFF',
          page: '#FCFCFA',
          secondary: '#F0EDE6',
          'secondary-subtle': '#F7F6F3',
          primary: '#2C2524',
          'primary-hover': '#0B0909',
          accent: '#62899B',
          'accent-subtle': '#E5EEF3',
          error: '#AD1D1D',
          'error-subtle': '#EFD2D2',
          info: '#62899B',
          'info-subtle': '#E5EEF3',
          warning: '#AD8252',
          'warning-subtle': '#F7EDE1',
          success: '#636F59',
          'success-subtle': '#E5E8E2',
          disabled: '#EBEAEA',
          'disabled-emphasis': '#AFABAB',
          // Warm-cream placeholder behind logo / brand previews
          'brand-subtle': '#FBF2EB',
          // Cooler hairline/chrome bg — matches border-control (#E8E5E0).
          // Used for neutral indicator bars, chips, etc.
          control: '#E8E5E0',
        },

        // ─── Borders ───
        // DEFAULT backs `border` alone + `divide-border` fallback color.
        // Named keys here emit the BASE class (e.g. `.border-default`); the
        // matching `@utility border-default { ... }` blocks in src/index.css
        // provide the same value AND generate responsive/state variants
        // (`md:border-default`, `hover:border-accent`, …). Nested keys under
        // @config alone don't emit variants in Tailwind v4.
        // If you add a border color here, also add an @utility for it in
        // src/index.css — otherwise the variant form silently no-ops.
        border: {
          DEFAULT: '#E2DBCF',
          default: '#E2DBCF',
          subtle: '#F0EDE6',
          strong: '#160F03',
          primary: '#2C2524',
          'primary-hover': '#0B0909',
          accent: '#62899B',
          'accent-subtle': '#E5EEF3',
          error: '#AD1D1D',
          'error-subtle': '#EFD2D2',
          info: '#62899B',
          'info-subtle': '#E5EEF3',
          warning: '#AD8252',
          'warning-subtle': '#F7EDE1',
          success: '#636F59',
          'success-subtle': '#E5E8E2',
          disabled: '#D7D5D5',
          control: '#E8E5E0',
        },

        // ─── Icons (family name has no utility collision) ───
        icon: {
          DEFAULT: '#5F5857',
          body: '#5F5857',
          primary: '#2C2524',
          'primary-hover': '#0B0909',
          'on-color': '#FFFFFF',
          secondary: '#878281',
          'secondary-hover': '#5F5857',
          'secondary-subtle': '#AFABAB',
          'secondary-subtle-hover': '#878281',
          accent: '#62899B',
          error: '#AD1D1D',
          info: '#62899B',
          warning: '#AD8252',
          success: '#636F59',
          disabled: '#AFABAB',
        },
      },

      // ──────────────────────────────────────────────────────────────────────
      // TYPOGRAPHY
      // ──────────────────────────────────────────────────────────────────────
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        serif: ['Spectral', 'Georgia', 'serif'],
      },

      // ──────────────────────────────────────────────────────────────────────
      // BORDER RADIUS
      // ──────────────────────────────────────────────────────────────────────
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },

      // ──────────────────────────────────────────────────────────────────────
      // BORDER WIDTH
      // ──────────────────────────────────────────────────────────────────────
      borderWidth: {
        0: '0px',
        DEFAULT: '1px',
        xs: '1px',
        sm: '2px',
        md: '4px',
        lg: '8px',
        xl: '16px',
      },

      // ──────────────────────────────────────────────────────────────────────
      // BREAKPOINTS
      // ──────────────────────────────────────────────────────────────────────
      screens: {
        mobile: '440px',
        desktop: '1440px',
      },
    },
  },
  plugins: [],
};
