import React from "react";
import { Image, Linking, Text, TouchableOpacity, View } from "react-native";

import { AdBanner as AdBannerType } from "../../types/ad";

type Props = {
  ad: AdBannerType;
};

export default function AdBanner({ ad }: Props) {
  const openAd = async () => {
    const canOpen = await Linking.canOpenURL(ad.targetUrl);
    if (!canOpen) return;
    await Linking.openURL(ad.targetUrl);
  };

  return (
    <View className="mt-6 px-4">
      {/* Card uses semantic surface tokens — auto-swaps on dark/light mode */}
      <View className="w-full self-stretch rounded-2xl border border-border bg-card p-4">
        <Text className="text-xs uppercase tracking-wide text-accent">
          Sponsored
        </Text>

        <View className="mt-3 h-36 w-full self-stretch items-center justify-center overflow-hidden rounded-xl bg-surface">
          <Image
            source={ad.image}
            className="h-full w-full"
            resizeMode="cover"
          />
        </View>

        <View className="mt-3 flex-row items-center">
          {ad.logo ? (
            <Image
              source={ad.logo}
              className="mr-2 h-6 w-6 rounded"
              resizeMode="contain"
            />
          ) : null}
          <Text className="text-sm text-text-muted">{ad.advertiser}</Text>
        </View>

        <Text className="mt-1 text-base font-semibold text-text">{ad.title}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={openAd}
          className="mt-3 self-start rounded-lg bg-accent px-4 py-2"
        >
          <Text className="text-sm font-semibold text-brand-black">{ad.cta}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
