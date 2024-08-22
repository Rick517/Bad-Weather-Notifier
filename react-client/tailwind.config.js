/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryBlue: '#00A3E0',
        secondaryBlue: '#87CEEB',
        accentGreen: '#98FF98'
      },
      fontFamily: {
        montserrat: 'Montserrat',
        openSans: 'Open-Sans, sans-serif',
        raleway: 'Raleway'
      }
    },
  },
  plugins: [],
}

