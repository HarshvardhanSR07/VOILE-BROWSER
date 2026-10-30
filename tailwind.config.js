/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        voile: {
          950: '#070a12',
          900: '#0B0F19',
          850: '#0E1524',
          800: '#131B2E',
          750: '#18223B',
          700: '#1E293B',
          600: '#334155',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          accent: '#38BDF8',
          accentDark: '#0284C7',
          indigo: '#6366F1',
          teal: '#14B8A6',
          purple: '#A855F7',
          emerald: '#10B981',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'voile-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'voile-glow': '0 0 25px -5px rgba(56, 189, 248, 0.15)',
        'voile-input': '0 2px 10px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
