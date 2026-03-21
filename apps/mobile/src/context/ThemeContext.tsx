/**
 * ThemeProvider
 * ─────────────────────────────────────────────────────────────────────────────
 * Supports three preferences: "system" (follows the device), "light", "dark".
 * The active preference is persisted so it survives app restarts.
 * NativeWind is kept in sync so all `dark:` Tailwind variants activate
 * correctly. The native AppearanceModule only accepts "light" | "dark",
 * so all values are resolved to one of those before calling setColorScheme.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";
import { useColorScheme as useSystemScheme } from "react-native";
import { useColorScheme as useNWScheme } from "nativewind";
import { semanticLight, semanticDark, type SemanticTokens } from "../theme/tokens";
import { secureStorage } from "../utils/secureStorage";

export type AppTheme = SemanticTokens;
export type ThemePreference = "system" | "light" | "dark";

const STORAGE_KEY = "theme_preference";

type ThemeContextValue = {
  isDark: boolean;
  theme: AppTheme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** Resolve any preference + system scheme to a strict "light" | "dark". */
function resolve(
  preference: ThemePreference,
  systemScheme: "light" | "dark",
): "light" | "dark" {
  if (preference === "system") return systemScheme;
  return preference;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  // Null-safe: Android can return null before AppearanceModule is ready.
  const systemScheme = useSystemScheme() ?? "light";
  const safeSystem: "light" | "dark" = systemScheme === "dark" ? "dark" : "light";

  const [preference, setPreferenceState] = useState<ThemePreference>("light");
  const { setColorScheme } = useNWScheme();

  // Load persisted preference once on mount.
  useEffect(() => {
    secureStorage.getItem(STORAGE_KEY).then((stored: string | null) => {
      if (stored === "light" || stored === "dark" || stored === "system") {
        setPreferenceState(stored as ThemePreference);
      }
    });
  }, []);

  const resolved: "light" | "dark" = resolve(preference, safeSystem);

  // The native AppearanceModule only accepts "light" | "dark" — never "system".
  // Always pass the concrete resolved value. Depends on both `preference` and
  // `safeSystem` so it re-fires when the user changes the preference OR when
  // the OS scheme changes while preference === "system".
  useEffect(() => {
    setColorScheme(resolved);
  }, [resolved, setColorScheme]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    secureStorage.setItem(STORAGE_KEY, p);
  }, []);

  const isDark = resolved === "dark";
  const theme: AppTheme = isDark ? semanticDark : semanticLight;

  return (
    <ThemeContext.Provider value={{ isDark, theme, preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Access theme context. Must be used inside <ThemeProvider>. */
export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeContext must be used inside ThemeProvider");
  return ctx;
}
