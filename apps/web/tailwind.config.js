/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Scientific palette: cool graphite + scientific blue + aqua accent.
        brand: {
          50: "#eef4ff",
          100: "#d9e6ff",
          200: "#bcd3ff",
          300: "#8db5ff",
          400: "#578cff",
          500: "#2f66f6",
          600: "#1f4de0",
          700: "#1b3db8",
          800: "#1c3593",
          900: "#1c3175",
        },
        aqua: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        graphite: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0b9c7",
          400: "#8592a5",
          500: "#65728a",
          600: "#505b70",
          700: "#42495b",
          800: "#393f4d",
          900: "#111318",
          950: "#0a0b0e",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
