import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useThemeContext, type ThemePreference } from "../context/ThemeContext";

const OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];

/**
 * Segmented control for selecting theme preference.
 * Place in a settings screen or profile page.
 */
export default function ThemeSelector() {
  const { preference, setPreference, theme } = useThemeContext();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.text }]}>Theme</Text>
      <View style={[styles.segmented, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {OPTIONS.map((opt) => {
          const active = preference === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setPreference(opt.value)}
              style={[
                styles.segment,
                active && { backgroundColor: theme.accent },
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text
                style={[
                  styles.segmentText,
                  { color: active ? "#000" : theme.textMuted },
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  segmented: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
