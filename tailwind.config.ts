import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg':           '#0B1410',
        'card':         '#172118',
        'card-2':       '#1E2B1F',
        'border-color': '#1E3022',
        'gold':         '#C9A84B',
        'text-primary': '#F2EDE4',
        'muted':        '#7A8C78',
        'success':      '#5BAA7A',
        'danger':       '#C97070',
      },
      borderRadius: {
        card:      '20px',
        'card-lg': '28px',
        input:     '14px',
        chip:      '999px',
      },
      boxShadow: {
        card:      '0 8px 32px rgba(0,0,0,0.4)',
        elevated:  '0 16px 48px rgba(0,0,0,0.6)',
        gold:      '0 0 24px rgba(201,168,75,0.25)',
        'gold-lg': '0 0 40px rgba(201,168,75,0.35)',
      },
      fontFamily: {
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}

export default config
