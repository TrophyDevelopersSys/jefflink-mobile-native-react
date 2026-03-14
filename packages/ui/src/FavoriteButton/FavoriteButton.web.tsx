import React from "react";

export interface FavoriteButtonProps {
  saved: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ saved, onToggle, size = "md", className = "" }: FavoriteButtonProps) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-base" : "w-10 h-10 text-xl";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={saved ? "Remove from saved" : "Save listing"}
      aria-pressed={saved ? "true" : "false"}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-black/30 transition-all hover:bg-black/50 ${className}`}
    >
      <span className={saved ? "text-brand-danger" : "text-white"}>{saved ? "♥" : "♡"}</span>
    </button>
  );
}
