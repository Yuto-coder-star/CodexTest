import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",
        foreground: "#1f2933"
      },
      boxShadow: {
        soft: "0 10px 30px -12px rgba(15, 23, 42, 0.12)"
      }
    },
    fontFamily: {
      sans: ["Inter", "Noto Sans JP", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"]
    }
  },
  plugins: []
};

export default config;
