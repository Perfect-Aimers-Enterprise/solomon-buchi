import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        milk: { DEFAULT: "#D8C3A5", soft: "#EBDFCB" },
        ivory: "#F8F5F0",
        charcoal: "#222222",
        brown: "#9B8065",
        stone: "#777777",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "Georgia", "serif"],
      },
      letterSpacing: { wordmark: "0.38em", label: "0.22em" },
      maxWidth: { page: "88rem" },
    },
  },
  plugins: [],
};

export default config;
