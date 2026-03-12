import { Pressable, Text, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";

const actions = [
  { label: "Buy Cars", helper: "Verified inventory" },
  { label: "Sell Vehicle", helper: "Instant review" },
  { label: "Hire Purchase", helper: "Flexible terms" },
  { label: "Dealers", helper: "Trusted partners" }
];

export default function QuickActionGrid() {
  return (
    <View className="flex-row flex-wrap justify-between px-6 pt-4">
      {actions.map((item, index) => (
        <MotiView
          key={item.label}
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 400, delay: index * 80 }}
          className="mb-4 w-[48%]"
        >
          <Pressable className="rounded-2xl border border-brand-slate bg-brand-night p-5">
            <View className="h-9 w-9 rounded-full bg-brand-accent/15" />
            <Text className="mt-4 text-sm font-semibold text-white">
              {item.label}
            </Text>
            <Text className="mt-1 text-xs text-brand-muted">
              {item.helper}
            </Text>
          </Pressable>
        </MotiView>
      ))}
    </View>
  );
}
