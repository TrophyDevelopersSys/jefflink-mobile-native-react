import React from "react";
import { View, TextInput, Pressable, Text, ScrollView } from "react-native";
import { Select } from "../Select";
import type { SelectOption } from "../Select";

export interface SearchFilter {
  key: string;
  label: string;
  options: SelectOption[];
  value?: string;
}

export interface SearchBarProps {
  filters?: SearchFilter[];
  onFilterChange?: (key: string, value: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  className?: string;
}

export function SearchBar({
  filters = [],
  onFilterChange,
  onSearch,
  searchPlaceholder = "Search listings…",
  searchValue = "",
  onSearchChange,
  className = "",
}: SearchBarProps) {
  return (
    <View className={`gap-3 ${className}`}>
      {filters.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-2">
          {filters.map((filter) => (
            <View key={filter.key} className="mr-2 min-w-[120px]">
              <Select
                placeholder={filter.label}
                options={filter.options}
                value={filter.value}
                onChange={(val) => onFilterChange?.(filter.key, val)}
              />
            </View>
          ))}
        </ScrollView>
      ) : null}

      <View className="flex-row gap-2">
        <View className="flex-1 flex-row items-center bg-surface border border-border rounded-input px-3 gap-2">
          <Text className="text-text-muted text-base">🔍</Text>
          <TextInput
            className="flex-1 py-3 text-sm text-text"
            placeholder={searchPlaceholder}
            placeholderTextColor="#9AA3AF"
            value={searchValue}
            onChangeText={onSearchChange}
            returnKeyType="search"
            onSubmitEditing={onSearch}
          />
        </View>
        <Pressable
          onPress={onSearch}
          className="bg-brand-primary px-4 py-3 rounded-input items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Search"
        >
          <Text className="text-white text-sm font-semibold">Search</Text>
        </Pressable>
      </View>
    </View>
  );
}
