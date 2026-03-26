/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#A41F39',
        'brand-pink': '#E56D85',
        'brand-light': '#FDB3C2',
        'tinted-white': '#FFF8F9',
      },
    },
  },
  plugins: [],
}
