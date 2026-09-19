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
        dark: {
          950: '#06090E',
          900: '#0B0F19',
          850: '#0F1523',
          800: '#141C2E',
          750: '#19233A',
          700: '#1F2B45',
          600: '#2C3B5E',
        },
        brand: {
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
          emerald: '#10B981',
          emeraldLight: '#34D399',
          rose: '#F43F5E',
          roseLight: '#FB7185',
          amber: '#F59E0B',
          amberLight: '#FBBF24',
          indigo: '#6366F1',
          indigoLight: '#818CF8',
          blue: '#3B82F6',
          blueLight: '#60A5FA',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 8px 32px 0 rgba(6, 182, 212, 0.15)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.3)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'glow-rose': '0 0 20px -5px rgba(244, 63, 94, 0.3)',
      }
    },
  },
  plugins: [],
}
