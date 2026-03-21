import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  ImageSourcePropType,
  Text,
  View,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useTheme } from "../../theme/useTheme";
import { useCmsHomepage } from "../../features/cms/cms.hooks";
import type { CmsSliderItem } from "@jefflink/types";

import HyundaiLogo from "../../assets/icons/hyundai.svg";
import ToyotaLogo from "../../assets/icons/toyota.svg";
import SubaruLogo from "../../assets/icons/subaru.svg";
import BenzLogo from "../../assets/icons/benz.svg";


type HeroBannerItem = {
  id: string;
  image: ImageSourcePropType;
  heading: string;
  text: string;
  Logo: any;
};

const staticBanners: HeroBannerItem[] = [
  {
    id: "1",
    image: require("../../assets/images/newCRETA.png"),
    heading: "New CRETA",
    text: "Choose from a range of cars.",
    Logo: HyundaiLogo,
  },
  {
    id: "2",
    image: require("../../assets/images/demo004.png"),
    heading: "SUBARU XV",
    text: "Explore verified vehicles from trusted sellers.",
    Logo: SubaruLogo,
  },
  {
    id: "3",
    image: require("../../assets/images/demo006.png"),
    heading: "TOYOTA HARRIER",
    text: "Flexible payment options like hire purchase.",
    Logo: ToyotaLogo,
  },
  {
    id: "4",
    image: require("../../assets/images/c300_4MaticSedan.png"),
    heading: "C 300 4MATIC Sedan",
    text: "Luxury vehicles available.",
    Logo: BenzLogo,
  },
];

type Props = {
  onLogin?: () => void;
};

// ── Map CMS sliders to the carousel display format ──────────────────────────
type DisplayItem =
  | { kind: "static"; data: HeroBannerItem }
  | { kind: "cms"; data: CmsSliderItem };

function useSliders(): DisplayItem[] {
  const { data: homepage } = useCmsHomepage();
  const cmsSliders = homepage?.layout?.slider;

  if (cmsSliders && cmsSliders.length > 0) {
    return cmsSliders.map((s) => ({ kind: "cms", data: s }));
  }

  return staticBanners.map((b) => ({ kind: "static", data: b }));
}

export default React.memo(function HeroCarousel({ onLogin }: Props) {
  const { isDark } = useTheme();
  const items = useSliders();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);

  const goNext = useCallback(() => {
    const next = (indexRef.current + 1) % items.length;
    indexRef.current = next;
    setIndex(next);
  }, [items.length]);

  const goPrev = useCallback(() => {
    const prev = (indexRef.current - 1 + items.length) % items.length;
    indexRef.current = prev;
    setIndex(prev);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(goNext, 4500);
    return () => clearInterval(timer);
  }, [goNext]);

  // Clamp index if items list shrinks (e.g. CMS→static fallback)
  const safeIndex = index < items.length ? index : 0;
  const item = items[safeIndex];

  return (
    <View className="bg-background">

      <View className="items-center px-6 pb-4">

        {item.kind === "static" ? (
          <>
            {/* Static banner: brand logo + heading + local image */}
            <View className="w-full items-center pt-6 pb-10">
              <View className="items-center mb-1">
                <item.data.Logo
                  width={90}
                  height={22}
                  style={isDark ? { tintColor: "#F9FAFB" } : undefined}
                />
              </View>
              <Text className="text-[30px] font-extrabold text-text tracking-wide text-center">
                {item.data.heading}
              </Text>
            </View>
            <Image
              source={item.data.image}
              resizeMode="contain"
              className="w-full h-[200px] -mt-20"
            />
            <Text className="text-center text-text-muted mt-3 px-4">
              {item.data.text}
            </Text>
          </>
        ) : (
          <>
            {/* CMS slider: title + CDN image + subtitle */}
            <View className="w-full items-center pt-6 pb-10">
              <Text className="text-[30px] font-extrabold text-text tracking-wide text-center">
                {item.data.title}
              </Text>
            </View>
            <Image
              source={{ uri: item.data.imageUrl }}
              resizeMode="contain"
              className="w-full h-[200px] -mt-20"
            />
            {item.data.subtitle ? (
              <Text className="text-center text-text-muted mt-3 px-4">
                {item.data.subtitle}
              </Text>
            ) : null}
          </>
        )}

        {/* CTA */}
        <View className="w-full items-start px-1">
          <TouchableOpacity
            onPress={onLogin}
            activeOpacity={0.9}
            className="mt-5 bg-accent px-7 py-3 rounded-full"
          >
            <Text className="font-semibold text-base text-white">
              {item.kind === "cms" && item.data.buttonLabel
                ? item.data.buttonLabel
                : "Check It"}
            </Text>
          </TouchableOpacity>
        </View>

      </View>

      {/* Tap Areas */}
      <Pressable
        onPress={goPrev}
        className="absolute left-0 top-0 bottom-8 w-[60px]"
      />

      <Pressable
        onPress={goNext}
        className="absolute right-0 top-0 bottom-8 w-[60px]"
      />

      {/* Pagination */}
      <View className="flex-row justify-center py-3">
        {items.map((_, i) => (
          <View
            key={i}
            className={
              i === safeIndex
                ? "h-2 w-6 mx-1 rounded-full bg-accent"
                : "h-2 w-2 mx-1 rounded-full bg-border"
            }
          />
        ))}
      </View>

    </View>
  );
});