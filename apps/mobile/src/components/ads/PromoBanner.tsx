import React, { memo, useCallback } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { PromoBanner as PromoBannerType } from "../../types/feed.types";
import { colors } from "../../constants/colors";

type Props = {
  banner: PromoBannerType;
};

function PromoBannerComponent({ banner }: Props) {
  const handlePress = useCallback(async () => {
    const supported = await Linking.canOpenURL(banner.targetUrl);
    if (supported) {
      await Linking.openURL(banner.targetUrl);
    }
  }, [banner.targetUrl]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.9}
      style={[
        styles.container,
        banner.backgroundColor
          ? { backgroundColor: banner.backgroundColor }
          : undefined,
      ]}
    >
      <Image
        source={{ uri: banner.image }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <Text style={styles.title}>{banner.title}</Text>
        {!!banner.subtitle && (
          <Text style={styles.subtitle}>{banner.subtitle}</Text>
        )}
        <View style={styles.ctaButton}>
          <Text style={styles.ctaText}>{banner.cta}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default memo(PromoBannerComponent);

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: colors.brandDark,
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    height: 160,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    backgroundColor: "rgba(0,0,0,0.50)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.white,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 12,
  },
  ctaButton: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    fontWeight: "600",
    color: colors.brandDark,
    fontSize: 13,
  },
});
