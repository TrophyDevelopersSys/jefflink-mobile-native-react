import React, { useEffect, useRef } from "react";
import { Animated, Text, View } from "react-native";

export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastProps {
  message: string;
  variant?: ToastVariant;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-brand-success",
  error:   "bg-brand-danger",
  warning: "bg-brand-warning",
  info:    "bg-blue-500",
};

const variantIcons: Record<ToastVariant, string> = {
  success: "✓",
  error:   "✕",
  warning: "⚠",
  info:    "ℹ",
};

export function Toast({ message, variant = "success", visible, onHide, duration = 3000 }: ToastProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(duration),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => onHide());
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={{ opacity }} className="absolute bottom-10 left-4 right-4 z-50">
      <View className={`flex-row items-center gap-3 px-4 py-3 rounded-card shadow-lg ${variantClasses[variant]}`}>
        <Text className="text-white text-base font-bold">{variantIcons[variant]}</Text>
        <Text className="text-white text-sm font-medium flex-1">{message}</Text>
      </View>
    </Animated.View>
  );
}
