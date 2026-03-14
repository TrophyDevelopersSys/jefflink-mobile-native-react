import React from "react";
import { View, Text, Image, Pressable } from "react-native";
import { PriceTag } from "../PriceTag";
import { Badge } from "../Badge";

export interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  currency?: string;
  location: string;
  imageUri?: string;
  sellerName?: string;
  isVerified?: boolean;
  isFeatured?: boolean;
  isSaved?: boolean;
  onPress?: () => void;
  onSave?: () => void;
  className?: string;
}

export function ListingCard({
  title,
  price,
  currency = "UGX",
  location,
  imageUri,
  sellerName,
  isVerified,
  isFeatured,
  isSaved,
  onPress,
  onSave,
  className = "",
}: ListingCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-card rounded-card overflow-hidden border border-border/40 active:opacity-90 ${className}`}
      accessibilityRole="button"
    >
      {/* Image */}
      <View className="relative bg-surface h-44">
        {imageUri ? (
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-text-muted text-3xl">🖼️</Text>
          </View>
        )}
        {/* Badges overlay */}
        <View className="absolute top-2 left-2 flex-row gap-1">
          {isFeatured ? <Badge label="Featured" variant="success" /> : null}
          {isVerified ? <Badge label="Verified" variant="info" /> : null}
        </View>
        {/* Save button */}
        <Pressable
          onPress={onSave}
          className="absolute top-2 right-2 bg-black/40 rounded-full w-8 h-8 items-center justify-center"
          accessibilityLabel={isSaved ? "Unsave listing" : "Save listing"}
        >
          <Text className="text-base">{isSaved ? "♥" : "♡"}</Text>
        </Pressable>
      </View>

      {/* Body */}
      <View className="p-3 gap-1">
        <Text className="text-sm font-semibold text-text" numberOfLines={2}>{title}</Text>
        <Text className="text-xs text-text-muted">📍 {location}</Text>
        <View className="flex-row items-center justify-between mt-1">
          <PriceTag amount={price} currency={currency} />
          {sellerName ? <Text className="text-xs text-text-muted">{sellerName}</Text> : null}
        </View>
      </View>
    </Pressable>
  );
}
