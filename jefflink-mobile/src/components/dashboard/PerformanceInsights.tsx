import React from "react";
import { View, Text } from "react-native";
import { Eye, MousePointerClick, TrendingUp } from "lucide-react-native";

const metrics = [
  { label: "Listing Views",   value: "3,420", sub: "+12% this week", Icon: Eye,               color: "#22C55E" },
  { label: "Contact Clicks",  value: "142",   sub: "+8% this week",  Icon: MousePointerClick, color: "#F59E0B" },
  { label: "Conversion Rate", value: "4.1%",  sub: "+0.3% this week", Icon: TrendingUp,       color: "#22C55E" },
] as const;

const chartData = [20, 40, 60, 30, 70, 90, 50];
const days      = ["M", "T", "W", "T", "F", "S", "S"] as const;
const maxVal    = Math.max(...chartData);

export default function PerformanceInsights() {
  return (
    <View className="mt-6">
      <Text className="text-white text-base font-semibold mb-3">Performance</Text>

      {/* Metric cards */}
      <View className="flex-row flex-wrap justify-between mb-4">
        {metrics.map(({ label, value, sub, Icon, color }, i) => (
          <View key={i} className="bg-brand-slate w-[48%] rounded-xl p-4 mb-3">
            <Icon size={18} color={color} strokeWidth={1.8} />
            <Text className="text-white text-xl font-bold mt-2">{value}</Text>
            <Text className="text-brand-muted text-xs mt-0.5">{label}</Text>
            <Text className="text-brand-accent text-xs mt-1">{sub}</Text>
          </View>
        ))}
      </View>

      {/* Bar chart placeholder */}
      <View className="bg-brand-slate rounded-xl p-4">
        <Text className="text-brand-muted text-xs mb-4">
          Listing Views — Last 7 Days
        </Text>
        <View className="flex-row items-end justify-between h-24 px-1">
          {chartData.map((h, i) => {
            const barHeight = Math.round((h / maxVal) * 72);
            return (
              <View key={i} className="flex-1 items-center gap-1">
                <View
                  style={{ height: barHeight }}
                  className="w-5 bg-brand-accent rounded-t-sm"
                />
                <Text className="text-brand-muted text-xs">{days[i]}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
