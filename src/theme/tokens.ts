/**
 * Design Token Registry
 * ─────────────────────────────────────────────────────────────────────────────
 * Single source of truth for every colour value in JeffLink.
 *
 * Hierarchy:
 *   palette  →  raw brand hex values (never change between themes)
 *   semantic →  purpose-mapped values that flip between light and dark
 *
 * Consumers:
 *   • tailwind.config.js  – maps semantic tokens to CSS variable references
 *   • global.css          – declares CSS variable values per colour scheme
 *   • ThemeContext.tsx    – exposes resolved token object for icon colour props
 *
 * Rule: components must use Tailwind utility classes (bg-background, text-text,
 * border-border …) derived from these tokens. Direct hex usage is forbidden in
 * component files except for icon `color` props via useThemeTokens().
 */

// ─── Brand Palette ────────────────────────────────────────────────────────────
// These are the immutable raw values that anchor the brand identity.

export const palette = {
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
} as const;

export type PaletteKey = keyof typeof palette;

// ─── Semantic Token Sets ──────────────────────────────────────────────────────
// These values are injected as CSS variables and automatically swap on dark mode.

export const semanticLight = {
  /** Page / screen background */
  background: "#FFFFFF",
  /** Slightly elevated surface (cards, inputs) */
  surface:    "#F5F5F5",
  /** Card background */
  card:       "#EFEFEF",
  /** Dividers and input borders */
  border:     "#E4E4E4",
  /** Primary body text */
  text:       "#0F1115",
  /** De-emphasised / caption text */
  textMuted:  "#6B7280",
  /** Brand green – CTAs, badges, highlights */
  accent:     "#22C55E",
  /** Deep brand green – primary buttons */
  primary:    "#0E7C3A",
  /** Destructive actions */
  danger:     "#DC2626",
  /** Cautionary states */
  warning:    "#F59E0B",
} as const;

export const semanticDark = {
  background: "#0F1115",
  surface:    "#1A1D23",
  card:       "#13161C",
  border:     "#2A2F36",
  text:       "#F9FAFB",
  textMuted:  "#9AA3AF",
  accent:     "#22C55E",
  primary:    "#0E7C3A",
  danger:     "#DC2626",
  warning:    "#F59E0B",
} as const;

export type SemanticTokens = {
  background: string;
  surface:    string;
  card:       string;
  border:     string;
  text:       string;
  textMuted:  string;
  accent:     string;
  primary:    string;
  danger:     string;
  warning:    string;
};
