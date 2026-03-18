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
        // Semantic map
        'bg-pink': '#FDB3C2',
        'border-pink': '#E56D85',
        'btn-red': '#A41F39',
        'text-dark': '#333333',
        'gray-light': '#f5f5f5',
        'gray-medium': '#e0e0e0',
        'gray-dark': '#666666',
      },
    },
  },
  plugins: [],
}
