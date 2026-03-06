import React, { memo, useCallback, useMemo } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  TouchableOpacity
} from "react-native";

// Module-level separator — one stable component reference, never remounted.
const SEPARATOR_WIDTH = 12;
const separatorStyle = { width: SEPARATOR_WIDTH } as const;
const ListingSeparator = memo(function ListingSeparator() {
  return <View style={separatorStyle} />;
});

// Module-level key extractors — no inline arrow allocation per render.
const keyExtractorListing = (item: ListingCardItem) => item.id;
const keyExtractorVendor = (item: VendorCardItem) => item.id;

import ListingCard, { type ListingCardItem } from "../cards/ListingCard";
import VendorCard, { type VendorCardItem } from "../cards/VendorCard";

type ListingCarouselType = "cars" | "land" | "vendors";

type ListingCarouselProps = {
  title: string;
  type: ListingCarouselType;
  onViewAll?: () => void;
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
    image: require("../../assets/images/Uganda-712-8143519.jpg.jpeg"),
    verified: true,
    vehiclesListed: 42,
    rating: 4.7
  },
  {
    id: "vendor-2",
    name: "Prime Land Brokers",
    specialty: "Land Consultant",
    image: require("../../assets/images/Uganda-928-9858166.jpg.jpeg"),
    verified: false,
    vehiclesListed: 18,
    rating: 4.4
  }
];

function ListingCarousel({
  title,
  type,
  onViewAll
}: ListingCarouselProps) {

  const { width } = useWindowDimensions();
  const cardStyle = useMemo(
    () => ({ width: Math.min(width - 32, 420) }),
    [width]
  );

  const vendorCardWidth = useMemo(
    () => Math.min(width - 32, 420),
    [width]
  );

  const vendorCardStyle = useMemo(
    () => ({ width: vendorCardWidth }),
    [vendorCardWidth]
  );

  const listingData = useMemo(
    () => (type === "cars" ? carsData : landData),
    [type]
  );

  const renderListingItem = useCallback(
    ({ item }: { item: ListingCardItem }) => (
      <ListingCard item={item} layout="horizontal" />
    ),
    []
  );

  const renderVendorItem = useCallback(
    ({ item }: { item: VendorCardItem }) => (
      <VendorCard item={item} containerStyle={vendorCardStyle} />
    ),
    [vendorCardStyle]
  );

  // Cards have a fixed width so we can skip all measurement during navigation.
  const cardWidth = useMemo(() => Math.min(width - 32, 420), [width]);

  const getVendorItemLayout = useCallback(
    (_: any, index: number) => ({
      length: vendorCardWidth,
      offset: (vendorCardWidth + SEPARATOR_WIDTH) * index,
      index
    }),
    [vendorCardWidth]
  );

  const getListingItemLayout = useCallback(
    (_: any, index: number) => ({
      length: cardWidth,
      offset: (cardWidth + SEPARATOR_WIDTH) * index,
      index
    }),
    [cardWidth]
  );

  return (
    <View className={type === "vendors" ? "mt-6" : "mt-8"}>

      {/* SECTION HEADER */}
      <View className="flex-row items-center justify-between px-4">

        <Text className="text-xl font-semibold text-brand-night">
          {title}
        </Text>

        <TouchableOpacity
          onPress={onViewAll}
          disabled={!onViewAll}
          activeOpacity={0.85}
          className={[
            "rounded-[48px] border border-brand-accent px-3 py-1",
            !onViewAll ? "opacity-40" : ""
          ].join(" ")}
        >
          <Text className="text-xs font-semibold text-brand-accent">View All</Text>
        </TouchableOpacity>

      </View>

      {/* CAR / LAND CAROUSEL */}
      {type !== "vendors" && (
        <FlatList<ListingCardItem>
          horizontal
          data={listingData}
          keyExtractor={keyExtractorListing}
          showsHorizontalScrollIndicator={true}
          contentContainerStyle={listingContentStyle}
          ItemSeparatorComponent={ListingSeparator}
          renderItem={renderListingItem}
          getItemLayout={getListingItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
        />
      )}

      {/* VENDOR CAROUSEL — full-width square cards, swipeable left-right */}
      {type === "vendors" && (
        <FlatList<VendorCardItem>
          horizontal
          data={vendorsData}
          keyExtractor={keyExtractorVendor}
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          snapToInterval={vendorCardWidth + SEPARATOR_WIDTH}
          contentContainerStyle={vendorContentStyle}
          ItemSeparatorComponent={ListingSeparator}
          renderItem={renderVendorItem}
          getItemLayout={getVendorItemLayout}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          windowSize={7}
          removeClippedSubviews
        />
      )}
    </View>
  );
}

export default memo(ListingCarousel);

// Static content container styles — defined outside the component so the
// reference is stable across every render (no new object allocation).
const listingContentStyle = {
  marginTop: 12,
  marginBottom: 32,
  paddingLeft: 16,
  paddingTop: 14,
  paddingRight: 8
} as const;

const vendorContentStyle = {
  paddingLeft: 16,
  paddingTop: 12,
  paddingRight: 8,
  marginTop: 12,
  marginBottom: 12
} as const;