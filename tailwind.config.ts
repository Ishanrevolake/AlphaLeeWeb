import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#ff7b7b",
          DEFAULT: "#ff4d4d", // Light red brand color
          dark: "#e60000",
        },
        background: {
          DEFAULT: "#ffffff",
          dark: "#f8fafc",
        }
      },
      borderRadius: {
        DEFAULT: "0.5rem",
      },
    },
  },
  plugins: [],
};
export default config;
