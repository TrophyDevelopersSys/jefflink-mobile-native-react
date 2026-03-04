import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import {
  Home,
  Search,
  PlusCircle,
  Wallet,
  User
} from "lucide-react-native";

type BottomNavItemKey = "home" | "search" | "sell" | "finance" | "profile";

type BottomNavProps = {
  activeKey?: BottomNavItemKey;
  onItemPress?: (item: BottomNavItemKey) => void;
};

const items: Array<{
  key: BottomNavItemKey;
  label: string;
  icon: React.ElementType;
}> = [
  { key: "home", label: "Home", icon: Home },
  { key: "search", label: "Search", icon: Search },
  { key: "sell", label: "Sell", icon: PlusCircle },
  { key: "finance", label: "Finance", icon: Wallet },
  { key: "profile", label: "Profile", icon: User }
];

export default function BottomNav({
  activeKey = "home",
  onItemPress
}: BottomNavProps) {
  return (
    <View className="flex-row justify-between border-t border-brand-slate bg-brand-night px-4 py-2">

      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.icon;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.85}
            onPress={() => onItemPress?.(item.key)}
            className="flex-1 items-center"
          >
            <Icon
              size={22}
              color={isActive ? "#22C55E" : "white"}
              strokeWidth={2}
            />

            <Text
              className={`mt-1 text-xs ${
                isActive ? "text-brand-accent" : "text-white"
              }`}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}