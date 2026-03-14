import React, { useState } from "react";
import { View, Text, Pressable, Modal, FlatList } from "react-native";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  label?: string;
  placeholder?: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
}

export function Select({
  label,
  placeholder = "Select…",
  options,
  value,
  onChange,
  error,
  className = "",
}: SelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View className={`gap-1 ${className}`}>
      {label ? <Text className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</Text> : null}
      <Pressable
        onPress={() => setOpen(true)}
        className={`flex-row items-center justify-between bg-surface border rounded-input px-3 py-3 ${
          error ? "border-brand-danger" : "border-border"
        }`}
        accessibilityRole="button"
      >
        <Text className={`text-sm ${selected ? "text-text" : "text-text-muted"}`}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text className="text-text-muted text-xs">▾</Text>
      </Pressable>
      {error ? <Text className="text-xs text-brand-danger">{error}</Text> : null}

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 bg-black/50 justify-end" onPress={() => setOpen(false)}>
          <View className="bg-card rounded-t-2xl pb-8">
            <View className="items-center py-3">
              <View className="w-10 h-1 rounded-full bg-border" />
            </View>
            {label ? <Text className="text-sm font-semibold text-text px-4 pb-3">{label}</Text> : null}
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => { onChange?.(item.value); setOpen(false); }}
                  className={`px-4 py-3.5 border-b border-border/40 ${item.value === value ? "bg-brand-primary/10" : ""}`}
                >
                  <Text className={`text-sm ${item.value === value ? "text-brand-accent font-semibold" : "text-text"}`}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}
