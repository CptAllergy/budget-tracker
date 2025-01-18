/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "theme-main": "#178cc3",
        "theme-light": "#f0ece4",
        "theme-loading-dark": "#cbd5e1",
        "theme-loading-light": "#ebebeb",
        "theme-background-light": "#F2F2F2",
        "theme-background-dark": "#D9D9D9",
      },
    },
    fontFamily: {
      nunito: ["nunito", "sans-serif"],
      MyFont: ['"My Font"', "serif"], // Ensure fonts with spaces have " " surrounding it.
      Montserrat: ["Montserrat", "sans-serif"],
    },
  },
  plugins: [],
};
