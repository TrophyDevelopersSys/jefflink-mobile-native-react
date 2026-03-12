/**
 * JeffLink Brand Color Tokens
 * Single source of truth for all brand colors across mobile and web.
 */
export const colors = {
  // Core brand palette
  brandPrimary:  "#0E7C3A",
  brandDark:     "#0F1115",
  brandNight:    "#13161C",
  brandSlate:    "#1A1D23",
  brandAccent:   "#22C55E",
  brandSuccess:  "#22C55E",
  brandWarning:  "#F59E0B",
  brandDanger:   "#DC2626",
  brandMuted:    "#9AA3AF",
  brandBlack:    "#0F1115",
  brandWhite:    "#F9FAFB",
  white:         "#FFFFFF",
  black:         "#000000",
} as const;

export type ColorKey = keyof typeof colors;
