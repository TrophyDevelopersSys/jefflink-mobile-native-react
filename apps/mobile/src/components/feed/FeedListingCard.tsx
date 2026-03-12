import React, { memo } from "react";
import {
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
  View,
} from "react-native";
import type { ListingSummary } from "../../types/listing.types";
import { colors } from "../../constants/colors";

type Props = {
  item: ListingSummary;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

/**
 * Square card used inside the horizontal Featured Listings carousel.
 * Image takes the top ~65% of the card; text lives below.
 */
function FeedListingCardComponent({ item, onPress, containerStyle }: Props) {
  return (
    <Pressable onPress={onPress} style={[styles.card, containerStyle]}>
      {/* IMAGE — top, bigger portion */}
      <View style={styles.imageWrap}>
        <Image
          source={item.coverUrl as ImageSourcePropType}
          style={styles.image}
          resizeMode="cover"
        />
      </View>

      {/* TEXT — below image */}
      <View style={styles.content}>
        <Text style={styles.price} numberOfLines={1}>
          UGX {item.price}
        </Text>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.location} numberOfLines={1}>
          {item.location}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.type === "vehicle" ? "Vehicle" : "Property"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export default memo(FeedListingCardComponent, (prev, next) => {
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

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    backgroundColor: colors.brandNight,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.brandSlate,
    // Square: aspectRatio 1 so the card height = injected width
    aspectRatio: 1,
  },
  imageWrap: {
    // ~65% of the card
    flex: 13,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  content: {
    // ~35% of the card
    flex: 7,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  price: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.brandAccent,
  },
  title: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: colors.white,
  },
  location: {
    marginTop: 2,
    fontSize: 12,
    color: colors.brandMuted,
  },
  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    borderRadius: 9999,
    backgroundColor: colors.brandSlate,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.brandMuted,
  },
});
