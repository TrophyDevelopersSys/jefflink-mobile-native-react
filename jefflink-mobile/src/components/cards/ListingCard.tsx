import React, { memo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Calendar, Fuel, Gauge, Heart, MapPin } from "lucide-react-native";

import { useThemeTokens } from "../../theme/useThemeTokens";

export type ListingCardItem = {
  id: string;
  title: string;
  price: string;
  image: ImageSourcePropType;
  location?: string;
  year?: string;
  mileage?: string;
  fuel?: string;
};

type ListingCardProps = {
  item: ListingCardItem;
  onPress?: () => void;
  onFavorite?: () => void;
  layout?: "vertical" | "horizontal";
  /** Additional Tailwind classes applied to the root container. */
  className?: string;
};

function ListingCardComponent({
  item,
  onPress,
  onFavorite,
  layout = "vertical",
  className,
}: ListingCardProps) {
  const isHorizontal = layout === "horizontal";
  // Used only for icon colour props — all container/text styling uses Tailwind.
  const tokens = useThemeTokens();

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className={`overflow-hidden rounded-2xl bg-card ${
        isHorizontal ? "w-[340px]" : "w-[260px]"
      }${className ? ` ${className}` : ""}`}
    >
      {isHorizontal ? (
        <View className="flex-row">
          {/* IMAGE */}
          <View className="relative">
            <Image
              source={item.image}
              style={{ width: 140, height: 130 }}
              resizeMode="cover"
            />
            {/* FAVORITE */}
            <TouchableOpacity
              onPress={onFavorite}
              activeOpacity={0.85}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              className="absolute right-2 top-2 rounded-full bg-black/60 p-2"
            >
              <Heart size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View className="flex-1 p-4">
            {/* PRICE */}
            <Text className="text-lg font-bold text-accent" numberOfLines={1}>
              UGX {item.price}
            </Text>

            {/* TITLE */}
            <Text className="mt-1 text-base font-semibold text-text" numberOfLines={1}>
              {item.title}
            </Text>

            {/* LOCATION */}
            {!!item.location && (
              <View className="mt-1 flex-row items-center">
                <MapPin size={14} color={tokens.textMuted} />
                <Text className="ml-1 shrink text-sm text-text-muted" numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}

            {/* META */}
            {(!!item.year || !!item.mileage || !!item.fuel) && (
              <View className="mt-3 flex-row flex-wrap gap-x-3">
                {!!item.year && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Calendar size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.year}
                    </Text>
                  </View>
                )}
                {!!item.mileage && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Gauge size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.mileage}
                    </Text>
                  </View>
                )}
                {!!item.fuel && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Fuel size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.fuel}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
      ) : (
        <>
          {/* IMAGE */}
          <View className="relative">
            <Image
              source={item.image}
              className="h-[150px] w-full"
              resizeMode="cover"
            />
            {/* FAVORITE */}
            <TouchableOpacity
              onPress={onFavorite}
              activeOpacity={0.85}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-2"
            >
              <Heart size={18} color="white" />
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View className="p-4">
            {/* PRICE */}
            <Text className="text-lg font-bold text-accent" numberOfLines={1}>
              UGX {item.price}
            </Text>

            {/* TITLE */}
            <Text className="mt-1 text-base font-semibold text-text" numberOfLines={1}>
              {item.title}
            </Text>

            {/* LOCATION */}
            {!!item.location && (
              <View className="mt-1 flex-row items-center">
                <MapPin size={14} color={tokens.textMuted} />
                <Text className="ml-1 shrink text-sm text-text-muted" numberOfLines={1}>
                  {item.location}
                </Text>
              </View>
            )}

            {/* META */}
            {(!!item.year || !!item.mileage || !!item.fuel) && (
              <View className="mt-3 flex-row flex-wrap justify-between gap-x-3">
                {!!item.year && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Calendar size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.year}
                    </Text>
                  </View>
                )}
                {!!item.mileage && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Gauge size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.mileage}
                    </Text>
                  </View>
                )}
                {!!item.fuel && (
                  <View className="mb-2 flex-row items-center gap-x-1">
                    <Fuel size={14} color={tokens.textMuted} />
                    <Text className="text-xs text-text-muted" numberOfLines={1}>
                      {item.fuel}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}

export const ListingCard = memo(ListingCardComponent);
export default ListingCard;
