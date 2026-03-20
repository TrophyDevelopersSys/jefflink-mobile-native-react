import React, { useRef, useState } from "react";
import { brand } from "@jefflink/design-tokens";
import {
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Menu, UserCircle } from "lucide-react-native";
import { SvgUri } from "react-native-svg";

import DrawerMenu, { type DrawerItemKey } from "./DrawerMenu";
import { useTheme } from "../../theme/useTheme";

type TopBarProps = {
  title?: string;
  showLogin?: boolean;
  onLoginPress?: () => void;
  onMenuItemPress?: (item: DrawerItemKey) => void;
  onLogoPress?: () => void;
  isLoggedIn?: boolean;
  onAccountPress?: () => void;
};

export default function TopBar({
  title,
  showLogin = true,
  onLoginPress,
  onMenuItemPress,
  onLogoPress,
  isLoggedIn = false,
  onAccountPress,
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isDark } = useTheme();
  // Only mount DrawerMenu after the first open so the 10+ SVG icons inside
  // don't parse/layout during app startup and cause the first-open delay.
  const hasOpenedMenu = useRef(false);
  if (menuOpen) hasOpenedMenu.current = true;

  return (
    <>
      <SafeAreaView edges={["top"]} className="bg-white dark:bg-brand-night">
        <View className="flex-row items-center justify-between h-14 px-4">

          {/* LOGO — tappable, navigates to home */}
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={onLogoPress}
            disabled={!onLogoPress}
          >
            <SvgUri
              uri={brand.assets.logo.primary}
              width={112}
              height={36}
            />
          </TouchableOpacity>

          {title ? (
            <Text className="font-semibold text-lg text-black dark:text-white">
              {title}
            </Text>
          ) : null}

          {/* RIGHT CONTROLS */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>

            {/* LOGIN / ACCOUNT BUTTON */}
            {isLoggedIn ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onAccountPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <UserCircle
                  size={28}
                  color={isDark ? "#FFFFFF" : "#000000"}
                  strokeWidth={1.6}
                />
              </TouchableOpacity>
            ) : showLogin ? (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onLoginPress}
                style={{
                  borderWidth: 1,
                  borderColor: "#22C55E",
                  paddingHorizontal: 10,
                  paddingVertical: 5,
                  borderRadius: 48
                }}
              >
                <Text style={{ color: "#22C55E", fontWeight: "600", fontSize: 16, lineHeight: 18 }}>
                  Login
                </Text>
              </TouchableOpacity>
            ) : null}

            {/* MENU BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMenuOpen(true)}
            >
              <Menu size={28} color={isDark ? "#FFFFFF" : "#000000"} />
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>

      {hasOpenedMenu.current && (
        <DrawerMenu
          visible={menuOpen}
          onClose={() => setMenuOpen(false)}
          onItemPress={onMenuItemPress}
        />
      )}
    </>
  );
}
