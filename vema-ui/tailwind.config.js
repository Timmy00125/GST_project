/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#3b82f6", // Custom primary color
      },
      fontFamily: {
        sans: ["Roboto", "Arial", "sans-serif"], // Custom font
      },
    },
  },
  plugins: [],
};
