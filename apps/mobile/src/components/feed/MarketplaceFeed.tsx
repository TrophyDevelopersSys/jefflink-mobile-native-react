import React, { useCallback, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { FlashList } from "@shopify/flash-list";

import type { FeedItem } from "../../types/feed.types";
import type { AdBanner } from "../../types/ad";
import type { VendorCardItem } from "../cards/VendorCard";
import {
  buildFeed,
  feedKeyExtractor,
  getFeedItemType,
} from "../../features/feed/feed.builder";
import { useFeed } from "../../features/feed/feed.hook";
import { FeedRenderer } from "./FeedRenderer";
import { colors } from "../../constants/colors";

type Props = {
  /**
   * Optional React element rendered above the first feed item (e.g. hero
   * carousel, search bar).  Passed directly to FlashList's
   * `ListHeaderComponent` so it participates in the same scroll context.
   */
  ListHeaderComponent?: React.ComponentType<unknown> | React.ReactElement | null;
  /** Ad to inject every 8 listing items. Pass null to suppress ads. */
  ad?: AdBanner | null;
  /** Vendor pool to inject every 15 listing items. */
  vendors?: VendorCardItem[];
};

// ─── Module-level stable references ──────────────────────────────────────────

const ItemSeparator = () => <View style={styles.separator} />;

const LoadingScreen = () => (
  <View style={styles.centered}>
    <ActivityIndicator size="large" color={colors.brandAccent} />
  </View>
);

const EmptyState = () => (
  <View style={styles.centered}>
    <Text style={styles.emptyText}>No listings available</Text>
  </View>
);

// ─── Component ────────────────────────────────────────────────────────────────

export default function MarketplaceFeed({
  ListHeaderComponent,
  ad = null,
  vendors = [],
}: Props) {
  const {
    listings,
    loading,
    refreshing,
    hasMore,
    loadInitial,
    loadMore,
    refresh,
  } = useFeed();

  // Kick off the first page on mount.
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  // ─── Build the heterogeneous feed array ──────────────────────────────────
  const feed = useMemo(
    () => buildFeed(listings, ad, vendors),
    [listings, ad, vendors]
  );

  // ─── Render callbacks ─────────────────────────────────────────────────────
  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => <FeedRenderer item={item} />,
    []
  );

  const ListFooterComponent = useCallback(() => {
    if (!loading || feed.length === 0) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.brandAccent} />
      </View>
    );
  }, [loading, feed.length]);

  // ─── Initial full-screen loader ───────────────────────────────────────────
  if (loading && feed.length === 0) {
    return <LoadingScreen />;
  }

  return (
    <FlashList
      data={feed}
      renderItem={renderItem}
      keyExtractor={feedKeyExtractor}
      getItemType={getFeedItemType}
      onEndReached={hasMore ? loadMore : undefined}
      onEndReachedThreshold={0.5}
      refreshing={refreshing}
      onRefresh={refresh}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={ItemSeparator}
      ListFooterComponent={ListFooterComponent}
      ListEmptyComponent={EmptyState}
      contentContainerStyle={styles.content}
      /**
       * Suppress the "sticky header indices" warning; we pass a header as a
       * component, not as a data item.
       */
      drawDistance={300}
    />
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: 24 },
  separator: { height: 1, backgroundColor: colors.brandSlate },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyText: { color: colors.brandMuted, fontSize: 14 },
  footer: { paddingVertical: 16, alignItems: "center" },
});
