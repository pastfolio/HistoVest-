/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}", // Ensure it includes pages
    "./components/**/*.{js,ts,jsx,tsx}" // Ensure it includes components
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "sans-serif"], // Use IBM Plex Sans globally
      },
      colors: {
        primary: "#facc15", // Yellow (for buttons & highlights)
        secondary: "#1a1a1a", // Dark background
        accent: "#ff9900", // Orange for gradients
      },
    },
  },
  plugins: [],
};
