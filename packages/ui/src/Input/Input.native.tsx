import React from "react";
import { TextInput, View, Text, TextInputProps } from "react-native";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export function Input({
  label,
  error,
  leftIcon,
  rightIcon,
  className = "",
  ...props
}: InputProps) {
  return (
    <View className={`gap-1 ${className}`}>
      {label ? <Text className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</Text> : null}
      <View className={`flex-row items-center bg-surface border rounded-input px-3 gap-2 ${error ? "border-brand-danger" : "border-border"}`}>
        {leftIcon}
        <TextInput
          className="flex-1 py-3 text-sm text-text"
          placeholderTextColor="#9AA3AF"
          {...props}
        />
        {rightIcon}
      </View>
      {error ? <Text className="text-xs text-brand-danger">{error}</Text> : null}
    </View>
  );
}
