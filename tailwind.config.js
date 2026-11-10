/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        vw: {
          bg: 'rgb(var(--vw-bg) / <alpha-value>)',
          surface: 'rgb(var(--vw-surface) / <alpha-value>)',
          card: 'rgb(var(--vw-card) / <alpha-value>)',
          border: 'rgb(var(--vw-border) / <alpha-value>)',
          muted: 'rgb(var(--vw-muted) / <alpha-value>)',
          text: 'rgb(var(--vw-text) / <alpha-value>)',
          textMuted: 'rgb(var(--vw-textMuted) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-vw': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
