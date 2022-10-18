/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'd-gray-1': '#252321',
        'd-gray-2': '#534F4A',
        'd-brown-1': '#DCDABC',
        'd-yellow': '#E1911D',
        'd-blue': '#2D3D40',
        'd-green': '#5A696C',
        'd-red': '#EE3123',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}
