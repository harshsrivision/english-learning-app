import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#151515",
        sand: "#f5efe4",
        clay: "#d96f32",
        teal: "#0d7a72",
        gold: "#d8a321"
      },
      fontFamily: {
        display: ["Georgia", "serif"],
        body: ["\"Trebuchet MS\"", "sans-serif"]
      },
      boxShadow: {
        card: "0 18px 45px rgba(21, 21, 21, 0.12)"
      },
      backgroundImage: {
        "hero-glow": "radial-gradient(circle at top, rgba(217, 111, 50, 0.18), transparent 45%), radial-gradient(circle at bottom right, rgba(13, 122, 114, 0.2), transparent 40%)"
      }
    }
  },
  plugins: []
};

export default config;
