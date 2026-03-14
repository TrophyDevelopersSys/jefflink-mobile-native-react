/**
 * JeffLink Shadow Tokens
 * Web-facing CSS shadow strings. Mobile uses elevation integers (not CSS).
 */
export const shadows = {
  sm:   "0 1px 2px rgba(0,0,0,0.05)",
  md:   "0 4px 10px rgba(0,0,0,0.10)",
  lg:   "0 10px 20px rgba(0,0,0,0.15)",
  xl:   "0 20px 40px rgba(0,0,0,0.20)",
  card: "0 2px 8px rgba(0,0,0,0.12)",
} as const;

/** React Native elevation equivalents (Android shadow depth) */
export const elevation = {
  sm:   2,
  md:   4,
  lg:   8,
  xl:   16,
  card: 3,
} as const;

export type ShadowKey = keyof typeof shadows;
