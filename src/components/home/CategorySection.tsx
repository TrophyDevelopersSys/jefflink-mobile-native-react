import React from "react";
import { Image, Text, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";

const categories = [
  {
    label: "SUVs",
    image: require("../../assets/images/Uganda-928-1463374.jpg.jpeg")
  },
  {
    label: "Sedans",
    image: require("../../assets/images/Uganda-928-1719697.jpg.jpeg")
  },
  {
    label: "Pickups",
    image: require("../../assets/images/Uganda-928-2020110.jpg.jpeg")
  },
  {
    label: "Electric",
    image: require("../../assets/images/Uganda-928-2315671.jpg.jpeg")
  }
] as const;

export default function CategorySection() {
  return (
    <View className="mt-8 flex-row flex-wrap justify-between px-5">
      {categories.map((cat, index) => (
        <MotiView
          key={cat.label}
          from={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: "timing", duration: 450, delay: index * 120 }}
          className="mb-4 h-36 w-[48%] overflow-hidden rounded-2xl"
        >
          <Image
            source={cat.image}
            className="h-full w-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 justify-end bg-brand-dark/55 p-4">
            <Text className="text-lg font-semibold text-white">{cat.label}</Text>
          </View>
        </MotiView>
      ))}
    </View>
  );
}
