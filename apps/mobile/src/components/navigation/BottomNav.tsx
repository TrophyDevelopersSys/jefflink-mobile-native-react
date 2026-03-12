import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../theme/useTheme";
import {
  Home,
  Search,
  PlusSquare,
  Wallet,
  UserCircle,
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
  { key: "home",    label: "Home",    Icon: Home        },
  { key: "search",  label: "Explore", Icon: Search      },
  { key: "sell",    label: "Sell",    Icon: PlusSquare  },
  { key: "finance", label: "Finance", Icon: Wallet      },
  { key: "profile", label: "Account", Icon: UserCircle  },
];

const ACCENT = "#22C55E";

export default function BottomNav({
  activeKey = "home",
  onItemPress
}: BottomNavProps) {
  const { theme } = useTheme();

  return (
    <View className="flex-row border-t border-border bg-surface px-2 pb-1 pt-2">
      {items.map((item) => {
        const isActive = item.key === activeKey;
        const Icon = item.Icon;

        return (
          <TouchableOpacity
            key={item.key}
            activeOpacity={0.75}
            onPress={() => onItemPress?.(item.key)}
            className="flex-1 items-center"
          >
            {/* Active indicator pill */}
            <View
              style={{
                width: 32,
                height: 3,
                borderRadius: 99,
                backgroundColor: isActive ? ACCENT : "transparent",
                marginBottom: 5,
              }}
            />
            <Icon
              size={22}
              color={isActive ? ACCENT : theme.text}
              strokeWidth={isActive ? 2.2 : 1.6}
            />
            <Text
              style={{
                marginTop: 3,
                fontSize: 10,
                fontWeight: isActive ? "700" : "400",
                color: isActive ? ACCENT : theme.text,
              }}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}