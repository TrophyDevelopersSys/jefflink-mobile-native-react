import React from "react";
import { View, Text, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/useTheme";
import { navigateToCustomerTab } from "../../navigation/navigationHelpers";

const listings = [
  { name: "Toyota Harrier",   price: "UGX 85,000,000", status: "Active"  },
  { name: "Subaru Forester",  price: "UGX 62,000,000", status: "Active"  },
  { name: "Toyota RAV4",      price: "UGX 74,000,000", status: "Pending" },
];

export default function ActiveListingsPreview() {
  const { theme } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-white text-base font-semibold">Active Listings</Text>
        <Pressable onPress={() => navigateToCustomerTab(navigation, "Listings")}>
          <Text className="text-brand-accent text-sm">View All</Text>
        </Pressable>
      </View>

      {listings.map((item, i) => (
        <Pressable
          key={i}
          onPress={() => navigation.navigate("ListingDetails" as never)}
          className="bg-brand-slate flex-row items-center justify-between p-4 rounded-xl mb-3 active:opacity-75"
        >
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm">{item.name}</Text>
            <Text className="text-brand-muted text-xs mt-0.5">{item.price}</Text>
          </View>

          <View className="flex-row items-center gap-2">
            <View
              className={`px-2 py-0.5 rounded-full ${
                item.status === "Active" ? "bg-brand-accent/20" : "bg-brand-warning/20"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.status === "Active" ? "text-brand-accent" : "text-brand-warning"
                }`}
              >
                {item.status}
              </Text>
            </View>
            <ChevronRight size={15} color={theme.textMuted} strokeWidth={1.8} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}
