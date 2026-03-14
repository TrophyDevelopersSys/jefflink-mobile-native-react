import React from "react";

export interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: "w-6 h-6 text-[8px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-xl",
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export function Avatar({ name, imageUri, size = "md", className = "" }: AvatarProps) {
  return (
    <div
      className={`${sizeMap[size]} rounded-full overflow-hidden bg-brand-primary/20 flex items-center justify-center flex-shrink-0 ${className}`}
    >
      {imageUri ? (
        <img src={imageUri} alt={name ?? "Avatar"} className="w-full h-full object-cover" />
      ) : (
        <span className="font-semibold text-brand-accent">{initials(name)}</span>
      )}
    </div>
  );
}
