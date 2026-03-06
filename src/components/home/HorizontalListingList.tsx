import React, { memo, useCallback } from "react";
import { FlatList, View } from "react-native";
import { View as MotiView } from "moti/build/components/view";
import ListingCard from "../listing/ListingCard";
import { useListings } from "../../features/listings/listings.hooks";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

import type { ListingSummary } from "../../types/listing.types";

type HorizontalListingListProps = {
  type: "featured" | "recent";
};

export default function HorizontalListingList({
  type
}: HorizontalListingListProps) {
  const { listings, loading, error } = useListings(type);

  const keyExtractor = useCallback((item: ListingSummary) => item.id, []);

  const renderItem = useCallback(
    ({ item, index }: { item: ListingSummary; index: number }) => {
      return <AnimatedListingCard item={item} index={index} />;
    },
    []
  );

  if (loading) {
    return (
      <View className="mt-4 px-6">
        <Spinner size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="mt-4 px-6">
        <EmptyState title="Unable to load" message={error} />
      </View>
    );
  }

  if (!listings.length) {
    return (
      <View className="mt-4 px-6">
        <EmptyState
          title="No listings yet"
          message="Inventory will appear once live data is available."
        />
      </View>
    );
  }

  return (
    <View className="mt-4 pl-6">
      <FlatList
        data={listings}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ItemSeparatorComponent={HorizontalSeparator}
        contentContainerStyle={{ paddingRight: 24 }}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={7}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews
        getItemLayout={(_, index) => {
          // ListingCard is a fixed 340px width, plus 16px separator.
          const length = 356;
          return { length, offset: length * index, index };
        }}
      />
    </View>
  );
}

const HorizontalSeparator = memo(function HorizontalSeparator() {
  return <View style={{ width: 16 }} />;
});

const AnimatedListingCard = memo(function AnimatedListingCard({
  item,
  index
}: {
  item: ListingSummary;
  index: number;
}) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: "timing", duration: 350, delay: index * 60 }}
    >
      <ListingCard item={item} />
    </MotiView>
  );
});
