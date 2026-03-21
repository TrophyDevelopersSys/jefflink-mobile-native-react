"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import type { ThemePreference } from "@jefflink/design-tokens";

/**
 * Compact theme toggle for the Navbar.
 * Cycles through light → dark → system on single click.
 */
export default function ThemeToggle() {
  const { isDark, preference, setPreference } = useTheme();

  // Defer to after hydration so SSR output (dark) matches initial client render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const showDark = mounted ? isDark : true;
  const displayPref = mounted ? preference : "dark";

  const cycle = () => {
    const order: ThemePreference[] = ["light", "dark", "system"];
    const next = order[(order.indexOf(preference) + 1) % order.length];
    setPreference(next);
  };

  return (
    <button
      onClick={cycle}
      className="relative p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface transition-colors"
      aria-label={`Theme: ${displayPref}. Click to switch.`}
      title={`Theme: ${displayPref}`}
    >
      {/* Sun icon (light mode) */}
      <Sun
        size={20}
        strokeWidth={2}
        className={`transition-transform duration-200 ${
          showDark ? "scale-0 absolute inset-0 m-auto" : "scale-100"
        }`}
      />
      {/* Moon icon (dark mode) */}
      <Moon
        size={20}
        strokeWidth={2}
        className={`transition-transform duration-200 ${
          showDark ? "scale-100" : "scale-0 absolute inset-0 m-auto"
        }`}
      />
      {/* System indicator dot */}
      {displayPref === "system" && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-brand-accent" />
      )}
    </button>
  );
}
