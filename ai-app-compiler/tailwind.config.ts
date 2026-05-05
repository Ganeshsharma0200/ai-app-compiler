import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        line: "#d8dee9",
        mist: "#f6f8fb",
        success: "#15803d",
        danger: "#b42318",
        warning: "#b54708"
      },
      boxShadow: {
        soft: "0 12px 40px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
