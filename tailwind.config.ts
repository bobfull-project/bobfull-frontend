import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#FF8A3D', active: '#E97228', soft: '#FFF0E5' },
        accent: { DEFAULT: '#016B61', active: '#00584F', soft: '#E7F2EE' },
        sub: { DEFAULT: '#8CBF9F', active: '#70A987', soft: '#EEF6F0' },
        ink: '#3D342F',
        muted: '#7C746D',
        line: '#EFE6DA',
        canvas: '#FBF7EF',
        surface: '#FFFFFF',
      },
      borderRadius: { card: '18px' },
      boxShadow: { card: '0 8px 28px rgba(61,52,47,.045)' },
    },
  },
  plugins: [],
} satisfies Config
