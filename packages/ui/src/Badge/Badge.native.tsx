import React from "react";
import { View, Text } from "react-native";

export interface BadgeProps {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  className?: string;
}

const variantClasses = {
  default: "bg-brand-muted/20 text-brand-muted",
  success: "bg-brand-success/20 text-brand-success",
  warning: "bg-brand-warning/20 text-brand-warning",
  danger:  "bg-brand-danger/20 text-brand-danger",
  info:    "bg-blue-500/20 text-blue-400",
};

export function Badge({ label, variant = "default", className = "" }: BadgeProps) {
  return (
    <View className={`rounded-badge px-2 py-0.5 ${variantClasses[variant]} ${className}`}>
      <Text className="text-xs font-medium">{label}</Text>
    </View>
  );
}
