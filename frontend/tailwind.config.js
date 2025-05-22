const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    flowbite.content(),
  ],
  theme: {
    extend: {

dropShadow: {
  'gold': '0 10px 8px rgba(215, 215, 0, 0.6)', // Using yellow-300 for a gold effect
},
    },
  },
  plugins: [
    require('daisyui')
  ],
}


