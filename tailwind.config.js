/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#2c1a0e",
        mist: "#fdf8f3",
        forest: {
          DEFAULT: "#c8441a",
          dark: "#a33514",
          soft: "#fde8dc"
        },
        teal: "#c8441a",
        sand: "#fdf0e6",
        clay: "#c8441a",
        gold: "#d4a017",
        sky: "#fff4ec",
        berry: "#b84147",
        sun: "#f4c85a",
        stone: "#7a5c4a",
        cloud: "#ffffff"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        sans: ["var(--font-body)"]
      },
      boxShadow: {
        card: "0 20px 60px rgba(44, 26, 14, 0.08)",
        float: "0 24px 70px rgba(44, 26, 14, 0.14)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(200, 68, 26, 0.12), transparent 35%), radial-gradient(circle at bottom right, rgba(212, 160, 23, 0.14), transparent 32%)"
      }
    }
  },
  plugins: []
};