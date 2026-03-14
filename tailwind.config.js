/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        clay: "#D9773A",
        ink: "#1B1B1B",
        sand: "#EFE7DB",
        teal: "#1C8D88"
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        sans: ["Inter", "sans-serif"]
      },
      boxShadow: {
        card: "0 10px 25px rgba(0,0,0,0.08)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(216,163,33,0.2), transparent 40%)"
      }
    }
  },
  plugins: []
};