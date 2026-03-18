import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#15211b",
        mist: "#f5fbf6",
        forest: {
          DEFAULT: "#0f8a4b",
          dark: "#0c6d3b",
          soft: "#dff4e5"
        },
        teal: "#0f8a4b",
        sand: "#edf7ef",
        clay: "#d96f32",
        gold: "#d8a321",
        sky: "#e8f1ff",
        berry: "#b84147",
        sun: "#f4c85a",
        stone: "#617066",
        cloud: "#ffffff"
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body: ["var(--font-body)"]
      },
      boxShadow: {
        card: "0 20px 60px rgba(15, 41, 23, 0.08)",
        float: "0 24px 70px rgba(15, 41, 23, 0.14)"
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(15, 138, 75, 0.18), transparent 35%), radial-gradient(circle at bottom right, rgba(244, 200, 90, 0.18), transparent 32%)"
      }
    }
  },
  plugins: []
};

export default config;
