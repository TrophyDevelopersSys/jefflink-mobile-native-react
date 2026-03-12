import React, { memo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Text,
  TouchableOpacity,
  View
} from "react-native";

export type VendorCardItem = {
  id: string;
  name: string;
  specialty: string;
  image: ImageSourcePropType;
};

type VendorCardProps = {
  item: VendorCardItem;
  onPress?: (id: string) => void;
};

function VendorCardComponent({ item, onPress }: VendorCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.88} onPress={() => onPress?.(item.id)} className="mr-4 w-56">
      <View className="overflow-hidden rounded-2xl border border-brand-slate bg-brand-night p-3">
        <Image source={item.image} className="h-24 w-24 self-center rounded-full" resizeMode="cover" />

        <Text className="mt-3 text-center font-semibold text-white" numberOfLines={1}>
          {item.name}
        </Text>
        <Text className="mt-1 text-center text-xs text-brand-muted" numberOfLines={1}>
          {item.specialty}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default memo(VendorCardComponent);
