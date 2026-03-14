import React from "react";
import { View, Pressable } from "react-native";

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export function Card({ children, onPress, className = "" }: CardProps) {
  const base = `bg-card rounded-card overflow-hidden border border-border/40 ${className}`;

  if (onPress) {
    return (
      <Pressable onPress={onPress} className={`${base} active:opacity-90`}>
        {children}
      </Pressable>
    );
  }
  return <View className={base}>{children}</View>;
}
