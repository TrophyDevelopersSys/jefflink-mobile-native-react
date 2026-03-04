import React, { memo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export type ListingCardItem = {
  id: string;
  title: string;
  price: string;
  image: ImageSourcePropType;
};

type ListingCardProps = {
  item: ListingCardItem;
  onPress?: (id: string) => void;
};

function ListingCardComponent({ item, onPress }: ListingCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => onPress?.(item.id)} className="mr-4 w-64">
      <View className="overflow-hidden rounded-2xl bg-brand-slate">
        <Image source={item.image} className="h-36 w-full" resizeMode="cover" />

        <View className="p-3">
          <Text className="font-semibold text-white" numberOfLines={1}>
            {item.title}
          </Text>

          <Text className="mt-1 font-bold text-brand-accent">UGX {item.price}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(ListingCardComponent);
