import React from "react";
import { ActivityIndicator, View } from "react-native";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
}

const sizeMap = { sm: "small", md: "small", lg: "large" } as const;

export function Spinner({ size = "md", color = "#22C55E", className = "" }: SpinnerProps) {
  return (
    <View className={`items-center justify-center ${className}`}>
      <ActivityIndicator size={sizeMap[size]} color={color} />
    </View>
  );
}
