import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";

export interface TabItem {
  key: string;
  label: string;
}

export interface TabsProps {
  tabs: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  children?: React.ReactNode;
  className?: string;
}

export function Tabs({ tabs, activeKey, onChange, className = "" }: TabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className={`border-b border-border/40 ${className}`}
      contentContainerStyle={{ paddingHorizontal: 4 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.key === activeKey;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onChange(tab.key)}
            className={`px-4 py-3 border-b-2 mr-1 ${isActive ? "border-brand-accent" : "border-transparent"}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
          >
            <Text className={`text-sm font-medium ${isActive ? "text-brand-accent" : "text-text-muted"}`}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
