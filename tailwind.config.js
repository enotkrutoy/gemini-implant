
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        medical: {
          950: '#020617', // Deepest background
          900: '#0f172a', // Secondary background
          800: '#1e293b', // Panel background
          700: '#334155', // Borders
          600: '#475569', // Muted text
          accent: '#0d9488', // Teal 600
          accentHover: '#0f766e', // Teal 700
          warning: '#f59e0b',
          danger: '#ef4444',
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
