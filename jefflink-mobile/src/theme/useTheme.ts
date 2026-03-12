/**
 * Convenience re-export so callers don't need to know which context file
 * the hook lives in.
 *
 * Usage:
 *   const { isDark, theme } = useTheme();
 *
 * Prefer Tailwind utility classes (bg-card, text-text …) for all view/text
 * styling. Reserve `theme.*` values for icon colour props only.
 */
export { useThemeContext as useTheme } from "../context/ThemeContext";
export type { ThemePreference, AppTheme } from "../context/ThemeContext";
