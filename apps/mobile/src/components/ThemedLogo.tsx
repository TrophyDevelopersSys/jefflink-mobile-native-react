import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import { getThemedLogo } from "@jefflink/design-tokens";
import { useThemeContext } from "../context/ThemeContext";

interface ThemedLogoProps {
  style?: StyleProp<ImageStyle>;
  height?: number;
}

/**
 * Renders the JeffLink logo, automatically switching between
 * the white variant (dark backgrounds) and dark variant (light backgrounds).
 */
export default function ThemedLogo({ style, height = 36 }: ThemedLogoProps) {
  const { isDark } = useThemeContext();
  const uri = getThemedLogo(isDark);

  return (
    <Image
      source={{ uri }}
      style={[{ height, width: height * 3.5 }, style]}
      resizeMode="contain"
      accessibilityLabel="JeffLink logo"
    />
  );
}
