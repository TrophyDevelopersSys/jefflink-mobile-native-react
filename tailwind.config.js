/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "brand-primary": "#0E7C3A",
        "brand-dark": "#0F1115",
        "brand-night": "#13161C",
        "brand-slate": "#1A1D23",
        "brand-accent": "#22C55E",
        "brand-success": "#22C55E",
        "brand-warning": "#F59E0B",
        "brand-danger": "#DC2626",
        "brand-muted": "#9AA3AF"
      }
    }
  },
  plugins: []
};
