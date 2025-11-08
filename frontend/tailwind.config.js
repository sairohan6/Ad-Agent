/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#3b82f6",
          cyan: "#00faff",
        }
      },
      backdropBlur: {
        xl: '24px',
      },
    },
  },
  plugins: [],
}
