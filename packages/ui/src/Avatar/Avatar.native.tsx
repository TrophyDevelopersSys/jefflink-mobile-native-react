import React from "react";
import { View, Text, Image } from "react-native";

export interface AvatarProps {
  name?: string;
  imageUri?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  xs: { container: "w-6 h-6", text: "text-[8px]" },
  sm: { container: "w-8 h-8", text: "text-xs" },
  md: { container: "w-10 h-10", text: "text-sm" },
  lg: { container: "w-14 h-14", text: "text-base" },
  xl: { container: "w-20 h-20", text: "text-xl" },
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length > 1
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export function Avatar({ name, imageUri, size = "md", className = "" }: AvatarProps) {
  const { container, text } = sizeMap[size];
  return (
    <View
      className={`${container} rounded-full overflow-hidden bg-brand-primary/20 items-center justify-center ${className}`}
    >
      {imageUri ? (
        <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
      ) : (
        <Text className={`${text} font-semibold text-brand-accent`}>{initials(name)}</Text>
      )}
    </View>
  );
}
