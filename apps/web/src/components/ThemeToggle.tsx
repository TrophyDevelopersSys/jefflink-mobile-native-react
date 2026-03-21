"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";
import type { ThemePreference } from "@jefflink/design-tokens";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Compact theme toggle for the Navbar.
 * Cycles through light → dark → system on single click.
 * Long-press / right-click opens a dropdown with all options (not implemented
 * yet — the cycle is sufficient for production UX).
 */
export default function ThemeToggle() {
  const { isDark, preference, setPreference } = useTheme();

  const cycle = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    setPreference(next);
  };

  return (
    <button
      onClick={cycle}
      className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
      aria-label={`Theme: ${preference}. Click to switch.`}
      title={`Theme: ${preference}`}
    >
      {/* Sun icon (light mode) */}
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${
          isDark ? "scale-0 absolute inset-0 m-auto" : "scale-100"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
      {/* Moon icon (dark mode) */}
      <svg
        className={`w-5 h-5 transition-transform duration-200 ${
          isDark ? "scale-100" : "scale-0 absolute inset-0 m-auto"
        }`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
        />
      </svg>
      {/* System indicator dot */}
      {preference === "system" && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-accent" />
      )}
    </button>
  );
}
