const flowbite = require("flowbite-react/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../node_modules/shared-components/**/*.{js,jsx}', // Shared library components
    flowbite.content(),
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          920: 'rgb(6 12 30);', //sidebar background
        },
      },
    },
  },
  plugins: [
    flowbite.plugin(),
  ],
}

