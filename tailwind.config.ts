import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          yellow: "#FCEFA2",
          lime: "#C6E970",
          orange: "#FFBF60",
          dark: "#111111",
          hill: "#1C5112",
          text: "#333333",
          white: "#FFFFFF"
        }
      },
      boxShadow: {
        soft: "0 18px 45px rgba(17, 17, 17, 0.12)"
      },
      borderRadius: {
        ui: "8px"
      }
    }
  },
  plugins: []
};

export default config;
