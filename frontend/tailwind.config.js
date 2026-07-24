/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#FF5A00',
        'primary-hover': '#E64D00',
        'offers': '#FF1E1E',
        'ratings': '#FFB800',
        'background-light': '#F5F5F5',
        'cards': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}