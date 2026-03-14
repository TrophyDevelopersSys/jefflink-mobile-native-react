import React from "react";
import { Text, View } from "react-native";

export interface PriceTagProps {
  amount: number;
  currency?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "text-sm font-semibold",
  md: "text-base font-bold",
  lg: "text-xl font-bold",
};

function formatAmount(amount: number): string {
  return amount.toLocaleString();
}

export function PriceTag({ amount, currency = "UGX", size = "md", className = "" }: PriceTagProps) {
  return (
    <View className={`flex-row items-baseline gap-1 ${className}`}>
      <Text className="text-xs text-brand-accent font-medium">{currency}</Text>
      <Text className={`text-brand-accent ${sizeClasses[size]}`}>{formatAmount(amount)}</Text>
    </View>
  );
}
