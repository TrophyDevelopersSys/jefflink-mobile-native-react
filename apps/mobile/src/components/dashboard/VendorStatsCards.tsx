import React from "react";
import { View, Text } from "react-native";
import { LayoutList, MessageSquare, TrendingUp, Eye } from "lucide-react-native";

const stats = [
  { label: "Listings", value: "24", Icon: LayoutList, color: "#22C55E" },
  { label: "Leads",    value: "12", Icon: MessageSquare, color: "#F59E0B" },
  { label: "Sales",    value: "5",  Icon: TrendingUp,  color: "#22C55E" },
  { label: "Views",    value: "3.4K", Icon: Eye,        color: "#9AA3AF" },
] as const;

export default function VendorStatsCards() {
  return (
    <View className="flex-row flex-wrap justify-between">
      {stats.map(({ label, value, Icon, color }, i) => (
        <View key={i} className="bg-brand-slate w-[48%] rounded-xl p-4 mb-4">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-brand-muted text-xs uppercase tracking-wide">
              {label}
            </Text>
            <Icon size={15} color={color} strokeWidth={1.8} />
          </View>
          <Text className="text-white text-2xl font-bold">{value}</Text>
        </View>
      ))}
    </View>
  );
}
