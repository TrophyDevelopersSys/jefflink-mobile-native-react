/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "brand-dark": "#0B0F1A",
        "brand-night": "#111827",
        "brand-slate": "#1F2937",
        "brand-accent": "#22D3EE",
        "brand-success": "#10B981",
        "brand-warning": "#F59E0B",
        "brand-danger": "#EF4444",
        "brand-muted": "#94A3B8"
      }
    }
  },
  plugins: []
};
