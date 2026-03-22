/**
 * Unified Theme Definitions
 * ─────────────────────────────────────────────────────────────────────────────
 * Pre-composed theme objects that combine semantic tokens with metadata.
 * Consumed by both web (ThemeProvider) and mobile (ThemeContext).
 */

export type ThemeMode = "light" | "dark";
export type ThemePreference = "system" | "light" | "dark";

export interface SemanticTokens {
  background: string;
  surface: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
  accent: string;
  primary: string;
  danger: string;
  warning: string;
}

export const lightSemanticTokens: SemanticTokens = {
  background: "#F9FAFB",
  surface: "#FFFFFF",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textMuted: "#6B7280",
  accent: "#22C55E",
  primary: "#1F7A3E",
  danger: "#DC2626",
  warning: "#F59E0B",
};

export const darkSemanticTokens: SemanticTokens = {
  background: "#0F1115",
  surface: "#13161C",
  card: "#1A1D23",
  border: "#2A2F36",
  text: "#F9FAFB",
  textMuted: "#9AA3AF",
  accent: "#22C55E",
  primary: "#1F7A3E",
  danger: "#DC2626",
  warning: "#F59E0B",
};

export interface ThemeDefinition {
  mode: ThemeMode;
  tokens: SemanticTokens;
}

export const darkTheme: ThemeDefinition = {
  mode: "dark",
  tokens: darkSemanticTokens,
};

export const lightTheme: ThemeDefinition = {
  mode: "light",
  tokens: lightSemanticTokens,
};
