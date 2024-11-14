/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        "akzidenz-regular": ["Akzidenz Grotesk Regular", "sans-serif"],
        "sf-semibold": ["SF Pro Display Semibold", "sans-serif"],
        "sf-medium": ["SF Pro Display Medium", "sans-serif"],
        "sf-regular": ["SF Pro Display Regular", "sans-serif"],
        "arial-narrow": ["Arial Narrow", "sans-serif"],
      },
      colors: {
        white: "#fff",
        grey: {
          50: "#f6f6f6",
          100: "#e7e7e7",
          200: "#d1d1d1",
          300: "#b0b0b0",
          400: "#888888",
          500: "#797979",
          600: "#5d5d5d",
          700: "#4f4f4f",
          800: "#454545",
          900: "#3d3d3d",
          950: "#262626",
        },
      },
      keyframes: {
        "border-spin": {
          "100%": {
            transform: "rotate(-360deg)",
          },
        },
      },
      animation: {
        "border-spin": "border-spin 7s linear infinite",
      },
    },
  },
  plugins: [],
};
