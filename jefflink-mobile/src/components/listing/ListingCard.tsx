import React, { memo } from "react";
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

function ListingCard({ item, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-[340px] flex-row overflow-hidden rounded-2xl border border-brand-slate bg-brand-night"
    >
      {/* Image */}
      <Image
        source={item.coverUrl as ImageSourcePropType}
        className="h-[120px] w-[140px]"
        resizeMode="cover"
      />

      {/* Content */}
      <View className="flex-1 p-3">
        <Text className="text-base font-bold text-brand-accent" numberOfLines={1}>
          UGX {item.price}
        </Text>

        <Text numberOfLines={1} className="mt-1 text-sm font-semibold text-white">
          {item.title}
        </Text>

        <Text numberOfLines={1} className="mt-1 text-xs text-brand-muted">
          {item.location}
        </Text>

        <View className="mt-2 self-start rounded-full bg-brand-slate px-2 py-1">
          <Text className="text-[10px] font-semibold text-brand-muted" numberOfLines={1}>
            {item.type === "vehicle" ? "Vehicle" : "Property"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(ListingCard, (prev, next) => {
  return (
    prev.onPress === next.onPress &&
    prev.item.id === next.item.id &&
    prev.item.title === next.item.title &&
    prev.item.price === next.item.price &&
    prev.item.location === next.item.location &&
    prev.item.type === next.item.type &&
    prev.item.coverUrl === next.item.coverUrl
  );
});