/**
 * JeffLink Breakpoint Tokens
 * Matches Tailwind's default breakpoints: sm/md/lg/xl/2xl.
 * Use for JS-side logic (e.g., conditional layouts).
 * In CSS/NativeWind, prefer the Tailwind responsive prefixes directly.
 */
export const breakpoints = {
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  xxl: 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;
