import React, { useMemo } from "react";
import { FlatList, Text, View } from "react-native";

import ListingCard, { type ListingCardItem } from "../cards/ListingCard";
import VendorCard, { type VendorCardItem } from "../cards/VendorCard";

type ListingCarouselType = "cars" | "land" | "vendors";

type ListingCarouselProps = {
  title: string;
  type: ListingCarouselType;
};

const carsData: ListingCardItem[] = [
  {
    id: "car-1",
    title: "Toyota Prado",
    price: "120,000,000",
    image: require("../../assets/images/subaru.webp")
  },
  {
    id: "car-2",
    title: "Mercedes C300",
    price: "95,000,000",
    image: require("../../assets/images/Uganda-928-6575532.jpg.jpeg")
  }
];

const landData: ListingCardItem[] = [
  {
    id: "land-1",
    title: "Mbarara 50x100 Plot",
    price: "40,000,000",
    image: require("../../assets/images/Uganda-928-5332972.jpg.jpeg")
  },
  {
    id: "land-2",
    title: "Mukono Roadside Plot",
    price: "55,000,000",
    image: require("../../assets/images/Uganda-928-6691779.jpg.jpeg")
  }
];

const vendorsData: VendorCardItem[] = [
  {
    id: "vendor-1",
    name: "Kampala Auto Hub",
    specialty: "Verified Dealer",
    image: require("../../assets/images/Uganda-712-8143519.jpg.jpeg")
  },
  {
    id: "vendor-2",
    name: "Prime Land Brokers",
    specialty: "Land Consultant",
    image: require("../../assets/images/Uganda-928-9858166.jpg.jpeg")
  }
];

export default function ListingCarousel({ title, type }: ListingCarouselProps) {
  const listingData = useMemo(
    () => (type === "cars" ? carsData : landData),
    [type]
  );

  return (
    <View className="mt-6">
      <Text className="px-4 text-lg font-semibold text-white">{title}</Text>

      {type === "vendors" ? (
        <FlatList<VendorCardItem>
          horizontal
          data={vendorsData}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingTop: 12 }}
          renderItem={({ item }) => <VendorCard item={item} />}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      ) : (
        <FlatList<ListingCardItem>
          horizontal
          data={listingData}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingTop: 12 }}
          renderItem={({ item }) => <ListingCard item={item} />}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}
    </View>
  );
}
