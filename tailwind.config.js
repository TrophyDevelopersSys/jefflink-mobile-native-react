/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // "class" strategy lets NativeWind toggle the dark variant via setColorScheme.
  // Theme switching updates only the root colour-scheme class — zero component re-renders.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── Immutable brand palette ──────────────────────────────────────────
        "brand-black":   "#0F1115",
        "brand-white":   "#F9FAFB",
        "brand-primary": "#0E7C3A",
        "brand-dark":    "#0F1115",
        "brand-night":   "#13161C",
        "brand-slate":   "#1A1D23",
        "brand-accent":  "#22C55E",
        "brand-success": "#22C55E",
        "brand-warning": "#F59E0B",
        "brand-danger":  "#DC2626",
        "brand-muted":   "#9AA3AF",

        // ── Semantic tokens (CSS-variable backed, auto-swap on dark mode) ────
        // Components use these: bg-background, bg-surface, bg-card,
        // text-text, text-text-muted, border-border, bg-accent, bg-primary …
        background:      "var(--color-background)",
        surface:         "var(--color-surface)",
        card:            "var(--color-card)",
        border:          "var(--color-border)",
        text:            "var(--color-text)",
        "text-muted":    "var(--color-text-muted)",
        accent:          "var(--color-accent)",
        primary:         "var(--color-primary)",
        danger:          "var(--color-danger)",
        warning:         "var(--color-warning)",
      },
    },
  },
  plugins: [],
};
