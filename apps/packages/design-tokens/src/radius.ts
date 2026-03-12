/**
 * JeffLink Border Radius Tokens
 */
export const radius = {
  none:   0,
  badge:  6,
  input:  8,
  button: 12,
  card:   16,
  modal:  20,
  full:   9999,
} as const;

export type RadiusKey = keyof typeof radius;
