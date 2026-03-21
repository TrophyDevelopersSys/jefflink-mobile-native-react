"use client";

/**
 * ThemeContext (Web)
 * ─────────────────────────────────────────────────────────────────────────────
 * Manages light / dark / system theme for the Next.js web application.
 *
 * • Reads system preference via `matchMedia("(prefers-color-scheme: dark)")`
 * • Persists user choice in localStorage
 * • Toggles the `dark` class on `<html>` for Tailwind `darkMode: "class"`
 * • Provides `useTheme()` hook with { isDark, mode, preference, setPreference }
 *
 * Anti-flicker: The root layout injects a blocking <script> that reads
 * localStorage and applies the class before first paint. This context then
 * hydrates to the same value, avoiding mismatch.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { ThemeMode, ThemePreference } from "@jefflink/design-tokens";

const STORAGE_KEY = "jefflink-theme";

interface ThemeContextValue {
  isDark: boolean;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getSystemPreference(): ThemeMode {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveMode(preference: ThemePreference): ThemeMode {
  if (preference === "system") return getSystemPreference();
  return preference;
}

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  // Add transition class for smooth color changes
  root.classList.add("theme-transition");
  if (mode === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
  root.style.colorScheme = mode;
  // Remove transition class after animation completes to avoid interfering
  // with other transitions (e.g. hover effects)
  window.setTimeout(() => root.classList.remove("theme-transition"), 300);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  // Initialize from what the blocking script already applied.
  const [preference, setPreferenceState] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored as ThemePreference;
    }
    return "light";
  });

  const mode = resolveMode(preference);
  const isDark = mode === "dark";

  // Apply class immediately on preference change.
  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  // Listen for system theme changes when preference is "system".
  useEffect(() => {
    if (preference !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyMode(resolveMode("system"));
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [preference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    localStorage.setItem(STORAGE_KEY, p);
    applyMode(resolveMode(p));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ isDark, mode, preference, setPreference }),
    [isDark, mode, preference, setPreference],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * Access the current theme state and setter.
 * Must be used inside `<ThemeProvider>`.
 */
export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
