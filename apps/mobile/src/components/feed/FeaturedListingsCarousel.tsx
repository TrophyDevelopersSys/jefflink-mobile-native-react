import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";

import FeedListingCard from "./FeedListingCard";
import { listingsFeedService } from "../../features/listings/listings.service";
import type { ListingSummary } from "../../types/listing.types";

const SEPARATOR_WIDTH = 12;

const Separator = memo(function Separator() {
  return <View style={{ width: SEPARATOR_WIDTH }} />;
});

const keyExtractor = (item: ListingSummary) => item.id;

export default memo(function FeaturedListingsCarousel() {
  const [items, setItems] = useState<ListingSummary[]>([]);
  const { width } = useWindowDimensions();

  useEffect(() => {
    listingsFeedService.getListings("featured").then((res) => {
      setItems(res.items);
    });
  }, []);

  // Full-width minus horizontal padding on each side
  const cardWidth = useMemo(() => width - 32, [width]);
  const cardStyle = useMemo(() => ({ width: cardWidth }), [cardWidth]);

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: cardWidth,
      offset: (cardWidth + SEPARATOR_WIDTH) * index,
      index,
    }),
    [cardWidth]
  );

  const renderItem = useCallback(
    ({ item }: { item: ListingSummary }) => (
      <FeedListingCard item={item} containerStyle={cardStyle} />
    ),
    [cardStyle]
  );

  return (
    <View style={{ marginTop: 32 }}>
      {/* Section header — matches ListingCarousel style */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <Text
          style={{ fontSize: 20, fontWeight: "600", color: "#13161C" }}
        >
          Featured Listings
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          disabled
          style={{
            borderWidth: 1,
            borderColor: "#22C55E",
            borderRadius: 48,
            paddingHorizontal: 12,
            paddingVertical: 4,
            opacity: 0.4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: "600", color: "#22C55E" }}>
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList<ListingSummary>
        horizontal
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={Separator}
        getItemLayout={getItemLayout}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToAlignment="start"
        snapToInterval={cardWidth + SEPARATOR_WIDTH}
        contentContainerStyle={{
          paddingLeft: 16,
          paddingRight: 8,
          paddingTop: 4,
          paddingBottom: 24,
        }}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
});
