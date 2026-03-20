/**
 * JeffLink Typography Tokens
 * Tailwind class strings for consistent text styling across platforms.
 */
export const typography = {
  display:  "font-sans text-3xl font-semibold",
  title:    "font-sans text-xl font-semibold",
  subtitle: "font-sans text-sm text-brand-muted",
  body:     "font-sans text-sm",
  caption:  "font-sans text-xs text-brand-muted",
  label:    "font-sans text-xs font-medium uppercase tracking-wide",
} as const;

export type TypographyKey = keyof typeof typography;
