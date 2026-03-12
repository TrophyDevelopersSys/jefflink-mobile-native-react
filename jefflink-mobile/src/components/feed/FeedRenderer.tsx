import React, { memo } from "react";
import type { FeedItem } from "../../types/feed.types";
import FeedListingCard from "./FeedListingCard";
import VendorCard from "../cards/VendorCard";
import AdBanner from "../ads/AdBanner";
import PromoBanner from "../ads/PromoBanner";

type Props = {
  item: FeedItem;
};

/**
 * Pure switch renderer for the marketplace feed.
 * Each branch returns a memoized leaf component — FeedRenderer itself
 * is also memo'd so FlashList's ViewHolder recycling doesn't cause
 * unnecessary re-renders when item references haven't changed.
 */
function FeedRendererComponent({ item }: Props) {
  switch (item.type) {
    case "listing":
      return <FeedListingCard item={item.data} />;

    case "vendor":
      return <VendorCard item={item.data} />;

    case "ad":
      return <AdBanner ad={item.data} />;

    case "banner":
      return <PromoBanner banner={item.data} />;

    default:
      return null;
  }
}

export const FeedRenderer = memo(FeedRendererComponent);
