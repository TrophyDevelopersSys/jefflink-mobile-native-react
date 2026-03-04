import React from "react";
import { TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "../../constants/colors";

type GlobalSearchBarProps = {
  value?: string;
  onChangeText?: (value: string) => void;
  onSubmitEditing?: () => void;
};

export default function GlobalSearchBar({
  value,
  onChangeText,
  onSubmitEditing
}: GlobalSearchBarProps) {
  return (
    <View className="mt-2 px-4">
      <View className="flex-row items-center rounded-xl bg-brand-slate px-4 py-3">
        <Ionicons name="search" size={20} color={colors.brandMuted} />

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="Search cars, land, houses and more"
          placeholderTextColor={colors.brandMuted}
          className="ml-2 flex-1 text-white"
          returnKeyType="search"
          autoCapitalize="none"
        />
      </View>
    </View>
  );
}
