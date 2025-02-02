/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}", 
    "./components/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        gold: "#C9A227",
        darkGold: "#B89B5E",
        darkGray: "#121212",
        mediumGray: "#1E1E1E",
        lightGray: "#EAEAEA",
      },
    },
  },
  plugins: [],
};
