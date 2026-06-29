/** @type {import('tailwindcss').Config} */
// Brand tokens are wired in via CSS variables (see src/index.css + src/config/theme.config.ts).
// NOTE: keep raw hex out of components — always reference these semantic token names.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  // Light-only site: gate dark: variants behind an explicit `.dark` class (never added)
  // so the aurora component's dark: styles don't activate via the OS color scheme.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: 'rgb(var(--brand-red) / <alpha-value>)',
          'red-dark': 'rgb(var(--brand-red-dark) / <alpha-value>)',
          black: 'rgb(var(--brand-black) / <alpha-value>)',
          charcoal: 'rgb(var(--brand-charcoal) / <alpha-value>)',
          steel: 'rgb(var(--brand-steel) / <alpha-value>)',
          chrome: 'rgb(var(--brand-chrome) / <alpha-value>)',
          white: 'rgb(var(--brand-white) / <alpha-value>)',
        },
      },
      fontFamily: {
        // SF Pro Display — the editorial display face (self-hosted, see src/index.css).
        display: ['"SF Pro Display"', '-apple-system', 'BlinkMacSystemFont', 'Helvetica Neue', 'sans-serif'],
        // Clean body sans for fine print / long-form legibility.
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        content: '80rem',
      },
      letterSpacing: {
        ultra: '0.22em',
      },
      boxShadow: {
        // Soft, navy-tinted premium shadows (no neon).
        glow: '0 0 0 1px rgb(var(--brand-steel) / 1), 0 18px 40px -24px rgb(14 34 56 / 0.28)',
        'glow-sm': '0 10px 26px -16px rgb(14 34 56 / 0.22)',
        card: '0 22px 60px -34px rgb(14 34 56 / 0.30)',
        'lift': '0 36px 80px -40px rgb(14 34 56 / 0.42)',
        soft: '0 2px 12px -6px rgb(14 34 56 / 0.14)',
      },
      backgroundImage: {
        // Soft evergreen halo (hero / CTA bands).
        'radial-red':
          'radial-gradient(60% 80% at 50% 0%, rgb(var(--brand-red) / 0.10), transparent 70%)',
        chrome:
          'linear-gradient(180deg, #ffffff 0%, #e9eaea 35%, #aeb0af 60%, #f4f5f5 100%)',
        steel:
          'linear-gradient(160deg, rgb(var(--brand-charcoal)) 0%, rgb(var(--brand-black)) 100%)',
      },
      keyframes: {
        // Aurora-background drift (from the aurora-background.tsx component).
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.7)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'border-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'roll-in': {
          '0%': { transform: 'translateX(-55%)', opacity: '0' },
          '60%': { opacity: '1' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(60%)', opacity: '0' },
          '55%': { opacity: '1' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        loadbar: {
          '0%': { transform: 'translateX(-110%)' },
          '100%': { transform: 'translateX(420%)' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-1.5%)' },
        },
        'speed-line': {
          '0%': { transform: 'translateX(0)', opacity: '0' },
          '30%': { opacity: '0.8' },
          '100%': { transform: 'translateX(-180%)', opacity: '0' },
        },
      },
      animation: {
        aurora: 'aurora 60s linear infinite',
        'fade-up': 'fade-up 0.6s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fade-in 0.8s ease both',
        'spin-slow': 'spin-slow 28s linear infinite',
        // Realistic wheel spin (reuses the spin-slow 0→360 keyframe at a readable speed).
        'spin-wheel': 'spin-slow 5s linear infinite',
        'spin-wheel-fast': 'spin-slow 1.1s linear infinite',
        'spin-wheel-roll': 'spin-slow 0.7s linear infinite',
        'slide-in-right': 'slide-in-right 1s cubic-bezier(0.22, 1, 0.36, 1) both',
        'page-in': 'page-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
        loadbar: 'loadbar 1.1s ease-in-out infinite',
        'marquee-fast': 'marquee 2.5s linear infinite',
        bob: 'bob 0.9s ease-in-out infinite',
        'speed-line': 'speed-line 0.9s linear infinite',
        'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
        marquee: 'marquee 30s linear infinite',
        'border-flow': 'border-flow 6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'roll-in': 'roll-in 1.2s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
