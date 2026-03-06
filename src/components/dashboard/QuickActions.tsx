import React from "react";
import { View, Text, Pressable } from "react-native";
import { PlusCircle, LayoutList, Zap, BarChart2 } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";

const actions = [
  { label: "Add Listing",      Icon: PlusCircle, screen: "Sell"           },
  { label: "Manage Listings",  Icon: LayoutList, screen: "Listings"        },
  { label: "Promote Listing",  Icon: Zap,        screen: "BoostListing"    },
  { label: "Analytics",        Icon: BarChart2,  screen: "VendorAnalytics" },
] as const;

export default function QuickActions() {
  const navigation = useNavigation<any>();

  return (
    <View className="mt-2">
      <Text className="text-white text-base font-semibold mb-3">Quick Actions</Text>
      <View className="flex-row flex-wrap justify-between">
        {actions.map(({ label, Icon, screen }, i) => (
          <Pressable
            key={i}
            onPress={() => navigation.navigate(screen as string)}
            className="bg-brand-primary w-[48%] p-4 rounded-xl mb-4 active:opacity-75"
          >
            <Icon size={20} color="#FFFFFF" strokeWidth={1.8} />
            <Text className="text-white font-semibold text-sm mt-2">{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
