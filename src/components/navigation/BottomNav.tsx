import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import {
  Home,
  Search,
  PlusCircle,
  Wallet,
  User,
  type LucideProps
} from "lucide-react-native";

export type BottomNavItemKey = "home" | "search" | "sell" | "finance" | "profile";

type BottomNavProps = {
  activeKey?: BottomNavItemKey;
  onItemPress?: (item: BottomNavItemKey) => void;
};

const items: Array<{
  key: BottomNavItemKey;
  label: string;
  Icon: React.ComponentType<LucideProps>;
}> = [
  { key: "home",    label: "Home",    Icon: Home      },
  { key: "search",  label: "Search",  Icon: Search    },
  { key: "sell",    label: "Sell",    Icon: PlusCircle },
  { key: "finance", label: "Finance", Icon: Wallet    },
  { key: "profile", label: "Profile", Icon: User      }
];

export default function BottomNav({
  activeKey = "home",
  onItemPress
}: BottomNavProps) {
  const { theme } = useTheme();
  return (
    <View className="flex-row justify-between border-t border-border bg-surface px-4 py-2">

      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.Icon;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.85}
            onPress={() => onItemPress?.(item.key)}
            className="flex-1 items-center"
          >
            <Icon size={22} color={isActive ? theme.accent : theme.text} />

            <Text
              className={`mt-1 text-xs ${
                isActive ? "text-brand-accent" : "text-text"
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