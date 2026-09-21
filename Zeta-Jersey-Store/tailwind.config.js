/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        zeta: { navy: "#1E1076", lime: "#C9DB2C" },
      },
      dropShadow: {
        title: "3px 4px 0 rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};