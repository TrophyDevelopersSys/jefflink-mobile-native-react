import React from "react";
import { Pressable, Text } from "react-native";

export interface FavoriteButtonProps {
  saved: boolean;
  onToggle: () => void;
  size?: "sm" | "md";
  className?: string;
}

export function FavoriteButton({ saved, onToggle, size = "md", className = "" }: FavoriteButtonProps) {
  const iconSize = size === "sm" ? "text-base" : "text-xl";
  const container = size === "sm" ? "w-8 h-8" : "w-10 h-10";
  return (
    <Pressable
      onPress={onToggle}
      className={`${container} items-center justify-center rounded-full bg-black/30 active:opacity-70 ${className}`}
      accessibilityRole="button"
      accessibilityLabel={saved ? "Remove from saved" : "Save listing"}
    >
      <Text className={`${iconSize} ${saved ? "text-brand-danger" : "text-white"}`}>
        {saved ? "♥" : "♡"}
      </Text>
    </Pressable>
  );
}
