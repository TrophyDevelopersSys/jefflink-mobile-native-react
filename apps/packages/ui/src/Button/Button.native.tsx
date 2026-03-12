import React from "react";
import { Pressable, Text, ActivityIndicator } from "react-native";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:   "bg-brand-primary",
  secondary: "bg-brand-slate border border-brand-muted/30",
  danger:    "bg-brand-danger",
  ghost:     "bg-transparent border border-brand-muted/30",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2",
  md: "px-4 py-3",
  lg: "px-6 py-4",
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  className = "",
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      className={`
        rounded-button items-center justify-center flex-row gap-2
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${isDisabled ? "opacity-50" : "active:opacity-80"}
        ${className}
      `.trim()}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text
          className={`text-white font-semibold ${textSizeClasses[size]}`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
