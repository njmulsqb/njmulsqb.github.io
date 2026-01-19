/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./_includes/**/*.html",
    "./_layouts/**/*.html",
    "./_posts/**/*.md",
    "./_pages/**/*.md",
    "./index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0066cc",
        secondary: "#333333",
      },
      spacing: {
        140: "8.75rem",
      },
    },
  },
  plugins: [],
};
