import React, { useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import DrawerMenu, { type DrawerItemKey } from "./DrawerMenu";
import { colors } from "../../constants/colors";

type TopBarProps = {
  title: string;
  onLoginPress?: () => void;
  onMenuItemPress?: (item: DrawerItemKey) => void;
};

export default function TopBar({
  title,
  onLoginPress,
  onMenuItemPress
}: TopBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <SafeAreaView style={{ backgroundColor: "#0F1115" }}>
        <View className="flex-row items-center justify-between px-4 py-3">

          {/* LEFT SIDE */}
          <View className="flex-row items-center">

            <Image
              source={require("../../assets/images/logo.png")}
              className="h-9 w-9"
              resizeMode="contain"
            />

            <Text
              numberOfLines={1}
              className="ml-2 text-base font-semibold text-white"
            >
              {title}
            </Text>

          </View>

          {/* RIGHT SIDE */}
          <View className="flex-row items-center">

            {/* LOGIN BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onLoginPress}
              className="mr-3 rounded-lg border border-[#22C55E] px-3 py-1.5"
            >
              <Text className="text-sm font-semibold text-[#22C55E]">
                Login
              </Text>
            </TouchableOpacity>

            {/* MENU BUTTON */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setMenuOpen(true)}
              className="rounded-lg p-2"
            >
              <Ionicons name="menu" size={22} color={colors.white} />
            </TouchableOpacity>

          </View>
        </View>
      </SafeAreaView>

      <DrawerMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onItemPress={onMenuItemPress}
      />
    </>
  );
}