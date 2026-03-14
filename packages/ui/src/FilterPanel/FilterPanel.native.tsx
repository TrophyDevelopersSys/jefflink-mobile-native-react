import React, { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { Select } from "../Select";
import type { SelectOption } from "../Select";

export interface FilterField {
  key: string;
  label: string;
  options: SelectOption[];
  value?: string;
}

export interface FilterPanelProps {
  filters: FilterField[];
  onFilterChange: (key: string, value: string) => void;
  onReset?: () => void;
  collapsible?: boolean;
  className?: string;
}

export function FilterPanel({
  filters,
  onFilterChange,
  onReset,
  collapsible = true,
  className = "",
}: FilterPanelProps) {
  const [expanded, setExpanded] = useState(!collapsible);

  return (
    <View className={`bg-surface border border-border/40 rounded-card ${className}`}>
      {collapsible ? (
        <Pressable
          onPress={() => setExpanded((v) => !v)}
          className="flex-row items-center justify-between px-4 py-3"
          accessibilityRole="button"
        >
          <Text className="text-sm font-semibold text-text">Filters</Text>
          <Text className="text-text-muted text-sm">{expanded ? "▴" : "▾"}</Text>
        </Pressable>
      ) : (
        <View className="px-4 pt-4">
          <Text className="text-sm font-semibold text-text mb-2">Filters</Text>
        </View>
      )}

      {expanded ? (
        <ScrollView className="px-4 pb-4">
          <View className="gap-3">
            {filters.map((f) => (
              <Select
                key={f.key}
                label={f.label}
                options={f.options}
                value={f.value}
                onChange={(val) => onFilterChange(f.key, val)}
              />
            ))}
            {onReset ? (
              <Pressable onPress={onReset} className="mt-1">
                <Text className="text-xs text-brand-danger text-center">Reset filters</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      ) : null}
    </View>
  );
}
