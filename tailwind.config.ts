import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#09090B',
          surface:   '#111115',
          'surface-2': '#18181D',
          'surface-3': '#222228',
        },
        accent: {
          gold:          '#C4A86A',
          'gold-bright': '#D4BA7C',
          petrol:        '#1B627A',
          'petrol-bright': '#2A7E98',
          /* legacy aliases */
          purple: '#674CBF',
          cyan:   '#18C3F3',
          green:  '#3F6A48',
          amber:  '#C4A86A',
        },
        text: {
          primary:   '#EDE9E0',
          secondary: '#7A7A84',
          muted:     '#4A4A52',
        },
        border: {
          subtle:  'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          gold:    'rgba(196,168,106,0.18)',
          petrol:  'rgba(27,98,122,0.22)',
        },
        status: {
          warning: '#C4A86A',
          danger:  '#C84040',
          info:    '#18C3F3',
          success: '#2E7D52',
        },
      },
      borderRadius: {
        card:    '20px',
        'card-lg': '28px',
        input:   '14px',
        chip:    '999px',
      },
      boxShadow: {
        card:      '0 8px 32px rgba(0,0,0,0.5)',
        elevated:  '0 16px 48px rgba(0,0,0,0.7)',
        gold:      '0 0 24px rgba(196,168,106,0.25)',
        'gold-lg': '0 0 40px rgba(196,168,106,0.35)',
        petrol:    '0 0 24px rgba(27,98,122,0.30)',
      },
      fontFamily: {
        sans:    ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
