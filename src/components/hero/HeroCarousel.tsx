import React from "react";
import {
  FlatList,
  Image,
  type ImageSourcePropType,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { View as MotiView } from "moti/build/components/view";

type HeroBannerItem = {
  id: string;
  image: ImageSourcePropType;
  text: string;
};

const banners: HeroBannerItem[] = [
  {
    id: "1",
    image: require("../../assets/images/subaru.jpg"),
    text: "Hot Sales by JeffLink"
  },
  {
    id: "2",
    image: require("../../assets/images/Uganda-928-5398255.jpg.jpeg"),
    text: "Verified Vehicles"
  }
];

export default function HeroCarousel() {
  const { width } = useWindowDimensions();

  return (
    <FlatList
      horizontal
      pagingEnabled
      data={banners}
      keyExtractor={(item) => item.id}
      showsHorizontalScrollIndicator={false}
      snapToAlignment="center"
      decelerationRate="fast"
      renderItem={({ item, index }) => (
        <MotiView
          from={{ opacity: 0, translateY: 12 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: "timing", duration: 350, delay: index * 80 }}
          className="mx-4 mt-4 overflow-hidden rounded-2xl"
          style={{ width: width - 32 }}
        >
          <Image source={item.image} className="h-48 w-full" resizeMode="cover" />

          <View className="absolute inset-x-0 bottom-0 bg-brand-dark/55 px-4 py-3">
            <Text className="text-xl font-bold text-white">{item.text}</Text>
          </View>
        </MotiView>
      )}
    />
  );
}
