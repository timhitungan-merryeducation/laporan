/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        sidebar: '#1e293b', // slate-800 yang lebih modern
        primary: '#2563eb', // blue-600
      }
    },
  },
  plugins: [],
}
