/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    '../node_modules/shared-components/**/*.{js,jsx}', // Shared library components
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          920: 'rgb(6 12 30);', //sidebar background
        },
      },
      boxShadow: {
        'custom': '0 4px 35px rgba(0, 0, 0, 0.5)', // Custom shadow with 25px blur radius
      },
    },
  },
  plugins: [],
}

