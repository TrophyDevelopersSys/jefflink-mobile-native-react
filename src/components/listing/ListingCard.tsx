import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  ImageSourcePropType
} from "react-native";

import type { ListingSummary } from "../../types/listing.types";

type Props = {
  item: ListingSummary;
  onPress?: () => void;
};

export default function ListingCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-4 w-64 rounded-2xl border border-brand-slate bg-brand-night overflow-hidden"
    >
      {/* Vehicle Image */}
      <Image
        source={item.coverUrl as ImageSourcePropType}
        className="h-36 w-full"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="p-3">
        <Text
          numberOfLines={1}
          className="text-sm font-semibold text-white"
        >
          {item.title}
        </Text>

        <Text className="mt-1 text-base font-bold text-brand-accent">
          UGX {item.price}
        </Text>

        <Text className="mt-1 text-xs text-brand-muted">
          {item.location}
        </Text>
      </View>
    </Pressable>
  );
}