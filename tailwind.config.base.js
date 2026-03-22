/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Immutable brand palette — single source of truth
        "brand-black":         "#0F1115",
        "brand-white":         "#F9FAFB",
        "brand-primary":       "#1F7A3E",
        "brand-primary-light": "#22C55E",
        "brand-blue":          "#2DA5D7",
        "brand-blue-dark":     "#1A8BBF",
        "brand-dark":          "#0F1115",
        "brand-night":         "#13161C",
        "brand-slate":         "#1A1D23",
        "brand-accent":        "#22C55E",
        "brand-success":       "#22C55E",
        "brand-warning":       "#F59E0B",
        "brand-danger":        "#DC2626",
        "brand-muted":         "#9AA3AF",

        // Semantic tokens (CSS-variable backed, auto-swap on dark mode)
        background:   "var(--color-background)",
        surface:      "var(--color-surface)",
        card:         "var(--color-card)",
        border:       "var(--color-border)",
        text:         "var(--color-text)",
        "text-muted": "var(--color-text-muted)",
        accent:       "var(--color-accent)",
        primary:      "var(--color-primary)",
        danger:       "var(--color-danger)",
        warning:      "var(--color-warning)",
      },
      borderRadius: {
        card:   "16px",
        button: "12px",
        input:  "8px",
        badge:  "6px",
      },
      fontFamily: {
        sans: ["Fabriga", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
