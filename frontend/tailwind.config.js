/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        surface: {
          DEFAULT: '#16181f',
          elevated: '#1e2130',
          overlay: '#242736',
        },
        brand: {
          DEFAULT: '#3b82f6',
          hover: '#60a5fa',
        },
      },
    },
  },
  plugins: [],
};
