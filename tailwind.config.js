/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './assets/js/**/*.js'],
  theme: {
    container: false,
    extend: {
      colors: {
        brand: 'var(--brand)',
        'brand-hover': 'var(--brand-hover)',
        btn: 'var(--btn)',
        'brand-ink': 'var(--brand-ink)',
        'brand-on-dark': 'var(--brand-on-dark)',
        graphite: 'var(--graphite)',
        'graphite-2': 'var(--graphite-2)',
        'graphite-3': 'var(--graphite-3)',
        paper: 'var(--paper)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        'muted-on-dark': 'var(--muted-on-dark)',
        line: 'var(--line)',
        'line-on-dark': 'var(--line-on-dark)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        display: ['clamp(2.25rem, 1.5rem + 2.9vw, 3.75rem)', { lineHeight: '1.04', letterSpacing: '-0.025em' }],
        h2: ['clamp(1.75rem, 1.35rem + 1.6vw, 2.625rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        h3: ['clamp(1.125rem, 1.05rem + 0.35vw, 1.375rem)', { lineHeight: '1.25', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        ctl: '8px',
        tile: '14px',
      },
      maxWidth: {
        page: '1240px',
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};
