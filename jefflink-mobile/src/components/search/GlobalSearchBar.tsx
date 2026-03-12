import React, { useState } from "react";
import { Keyboard, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import { Search, XCircle } from "lucide-react-native";

import { colors } from "../../constants/colors";
import { useTheme } from "../../theme/useTheme";

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
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();

  const iconColor = isFocused ? colors.brandAccent : colors.brandMuted;
  const inputTextColor = isDark ? colors.white : colors.black;
  const rowDynamic = isFocused
    ? { backgroundColor: isDark ? colors.brandNight : "#FFFFFF", borderColor: colors.brandAccent }
    : { backgroundColor: isDark ? colors.brandSlate : "#F1F5F9", borderColor: isDark ? colors.brandSlate : "#E2E8F0" };

  const hasValue = !!value?.trim().length;

  const handleClear = () => {
    onChangeText?.("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.row, rowDynamic]}>
        <View style={styles.iconWrap}>
          <Search size={20} color={iconColor} />
        </View>

        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder="Search cars, land, houses and more"
          placeholderTextColor={colors.brandMuted}
          style={[
            styles.input,
            { color: inputTextColor },
            // Keep placeholder/text inline with the icon
            { paddingVertical: 0, textAlignVertical: "center", includeFontPadding: false } as any
          ]}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Search listings"
          accessibilityHint="Search cars, land, houses and more"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {hasValue && (
          <TouchableOpacity
            onPress={handleClear}
            activeOpacity={0.8}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            style={styles.clearButton}
          >
            <XCircle size={18} color={iconColor} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginTop: 0,
    paddingHorizontal: 0
  },
  row: {
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center"
  },
  rowBlurred: {
    backgroundColor: colors.white,
    borderColor: colors.white
  },
  rowFocused: {
    backgroundColor: colors.white,
    borderColor: colors.white
  },
  iconWrap: {
    height: 48,
    justifyContent: "center",
    alignItems: "center"
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    lineHeight: 20,
    height: 48,
  },
  clearButton: {
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    paddingLeft: 8,
  }
});