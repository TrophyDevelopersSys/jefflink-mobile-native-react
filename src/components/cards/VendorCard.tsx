import React, { memo } from "react";
import {
  Image,
  type ImageSourcePropType,
  type StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  type ViewStyle,
  View
} from "react-native";

import { BadgeCheck, Star } from "lucide-react-native";

import { colors } from "../../constants/colors";

export type VendorCardItem = {
  id: string;
  name: string;
  specialty: string;
  image: ImageSourcePropType;

  verified?: boolean;
  vehiclesListed?: number;
  rating?: number;
};

type VendorCardProps = {
  item: VendorCardItem;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

function VendorCardComponent({ item, onPress, containerStyle }: VendorCardProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      style={[styles.container, containerStyle]}
    >
      {/* IMAGE — top, takes majority of card height */}
      <View style={styles.imageWrap}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
      </View>

      {/* CONTENT — below image */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          {!!item.verified && (
            <View style={styles.verifiedWrap}>
              <BadgeCheck size={16} color={colors.brandSuccess} />
            </View>
          )}
        </View>

        <Text style={styles.specialty} numberOfLines={1}>
          {item.specialty}
        </Text>

        {(typeof item.vehiclesListed === "number" || typeof item.rating === "number") && (
          <View style={styles.metaRow}>
            {typeof item.vehiclesListed === "number" && (
              <Text style={styles.metaText} numberOfLines={1}>
                {item.vehiclesListed} Vehicles
              </Text>
            )}
            {typeof item.rating === "number" && (
              <View style={styles.ratingRow}>
                <Star size={14} color={colors.brandWarning} />
                <Text style={styles.metaText} numberOfLines={1}>
                  {item.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.brandNight,
    // Square card: height matches whatever width is injected via containerStyle
    aspectRatio: 1
  },
  imageWrap: {
    // Image takes ~68% of the square height
    flex: 17
  },
  image: {
    width: "100%",
    height: "100%"
  },
  content: {
    // Text area takes the remaining ~32%
    flex: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center"
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center"
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: colors.white
  },
  verifiedWrap: {
    marginLeft: 6
  },
  specialty: {
    marginTop: 2,
    fontSize: 12,
    color: colors.brandMuted
  },
  metaRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  metaText: {
    fontSize: 12,
    color: colors.brandMuted
  }
});

export default memo(VendorCardComponent, (prev, next) => {
  return (
    prev.onPress === next.onPress &&
    prev.containerStyle === next.containerStyle &&
    prev.item.id === next.item.id &&
    prev.item.name === next.item.name &&
    prev.item.specialty === next.item.specialty &&
    prev.item.image === next.item.image &&
    prev.item.verified === next.item.verified &&
    prev.item.vehiclesListed === next.item.vehiclesListed &&
    prev.item.rating === next.item.rating
  );
});
