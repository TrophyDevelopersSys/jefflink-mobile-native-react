import React from "react";
import { View, Text, Pressable } from "react-native";
import { Avatar } from "../Avatar";
import { Badge } from "../Badge";

export interface VendorCardProps {
  id: string;
  name: string;
  logoUri?: string;
  location?: string;
  listingsCount?: number;
  rating?: number;
  isVerified?: boolean;
  onPress?: () => void;
  className?: string;
}

export function VendorCard({
  name,
  logoUri,
  location,
  listingsCount,
  rating,
  isVerified,
  onPress,
  className = "",
}: VendorCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`bg-card rounded-card border border-border/40 p-4 flex-row items-center gap-3 active:opacity-90 ${className}`}
      accessibilityRole="button"
    >
      <Avatar name={name} imageUri={logoUri} size="lg" />
      <View className="flex-1 gap-0.5">
        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-text">{name}</Text>
          {isVerified ? <Badge label="Verified" variant="success" /> : null}
        </View>
        {location ? <Text className="text-xs text-text-muted">📍 {location}</Text> : null}
        <View className="flex-row gap-3 mt-1">
          {listingsCount !== undefined ? (
            <Text className="text-xs text-text-muted">{listingsCount} listings</Text>
          ) : null}
          {rating !== undefined ? (
            <Text className="text-xs text-brand-warning">★ {rating.toFixed(1)}</Text>
          ) : null}
        </View>
      </View>
      <Text className="text-text-muted">›</Text>
    </Pressable>
  );
}
