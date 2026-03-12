import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type AdBannerProps = {
  onPress?: () => void;
};

export default function AdBanner({ onPress }: AdBannerProps) {
  return (
    <View className="mt-6 px-4">
      <View className="rounded-2xl border border-brand-slate bg-brand-night p-4">
        <Text className="text-xs uppercase tracking-wide text-brand-accent">
          Sponsored
        </Text>
        <Text className="mt-2 text-base font-semibold text-white">
          Flexible asset finance for cars and land
        </Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onPress}
          className="mt-3 self-start rounded-lg bg-brand-accent px-4 py-2"
        >
          <Text className="text-sm font-semibold text-black">Learn More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
