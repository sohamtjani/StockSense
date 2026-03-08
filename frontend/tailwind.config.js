/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          bg: "#080f2b",
          panel: "#111c48",
          card: "#16275f",
          accent: "#3b82f6",
          cyan: "#39c9ff",
          green: "#2dd4bf",
          red: "#fb7185"
        }
      },
      boxShadow: {
        soft: "0 12px 30px rgba(0,0,0,0.18)"
      }
    }
  },
  plugins: []
};
