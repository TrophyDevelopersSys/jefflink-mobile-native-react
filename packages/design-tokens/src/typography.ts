/**
 * JeffLink Typography Tokens
 * Tailwind class strings for consistent text styling across platforms.
 */
export const typography = {
  display:  "text-3xl font-semibold",
  title:    "text-xl font-semibold",
  subtitle: "text-sm text-brand-muted",
  body:     "text-sm",
  caption:  "text-xs text-brand-muted",
  label:    "text-xs font-medium uppercase tracking-wide",
} as const;

export type TypographyKey = keyof typeof typography;
