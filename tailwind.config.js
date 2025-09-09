/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          light: '#E6F0FA',
          medium: '#3B82F6',
          dark: '#1D4ED8',
        }
      }
    },
  },
  plugins: [],
}
