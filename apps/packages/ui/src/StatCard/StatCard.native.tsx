import React from "react";
import { View, Text } from "react-native";

export interface StatCardProps {
  label: string;
  value: string | number;
  delta?: string;
  positive?: boolean;
  className?: string;
}

export function StatCard({ label, value, delta, positive, className = "" }: StatCardProps) {
  return (
    <View className={`bg-brand-slate rounded-card p-4 flex-1 ${className}`}>
      <Text className="text-brand-muted text-xs mb-1">{label}</Text>
      <Text className="text-white text-xl font-semibold">{String(value)}</Text>
      {delta !== undefined && (
        <Text
          className={`text-xs mt-1 font-medium ${
            positive ? "text-brand-success" : "text-brand-danger"
          }`}
        >
          {positive ? "+" : ""}{delta}
        </Text>
      )}
    </View>
  );
}
