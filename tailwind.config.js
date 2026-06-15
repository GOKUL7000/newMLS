/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1a56db', dark: '#1e429f', light: '#e8eefb' },
      },
      fontFamily: { sans: ['Plus Jakarta Sans', 'sans-serif'] },
    },
  },
  plugins: [],
}
