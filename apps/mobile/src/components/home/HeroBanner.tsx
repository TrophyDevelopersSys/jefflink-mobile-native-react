import React from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";

type HeroBannerProps = {
  onExplore?: () => void;
};

export default function HeroBanner({ onExplore }: HeroBannerProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 30 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 600 }}
      className="mx-5 overflow-hidden rounded-3xl"
    >
      <Image
        source={require("../../assets/images/subaru.jpg")}
        className="h-56 w-full"
        resizeMode="cover"
      />

      <View className="absolute inset-0 justify-end bg-brand-dark/60 p-6">
        <Text className="text-2xl font-bold text-white">Drive Now. Pay Later.</Text>
        <Text className="mt-2 text-sm text-brand-muted">
          Flexible hire purchase options.
        </Text>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onExplore}
          className="mt-4 self-start rounded-xl bg-brand-accent px-5 py-3"
        >
          <Text className="font-semibold text-black">Explore Cars</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );
}
