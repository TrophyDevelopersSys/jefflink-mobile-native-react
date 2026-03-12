import type { ListingSummary } from "../../types/listing.types";
import type { AdBanner } from "../../types/ad";
import type { VendorCardItem } from "../../components/cards/VendorCard";
import type { FeedItem } from "../../types/feed.types";

/** Inject one ad card every N listing items. */
const AD_FREQUENCY = 8;

/** Inject one vendor card every N listing items (after the ad). */
const VENDOR_FREQUENCY = 15;

/**
 * Builds a heterogeneous feed from raw listings, an optional ad, and an
 * optional vendor pool.  This is a pure function so it can be cheaply
 * recomputed inside a `useMemo` whenever the inputs change.
 *
 * Insertion order per page window:
 *   listings[0..6] → ad (if provided) → listings[7..14] → vendor → …
 */
export function buildFeed(
  listings: ListingSummary[],
  ad: AdBanner | null = null,
  vendors: VendorCardItem[] = []
): FeedItem[] {
  const result: FeedItem[] = [];

  for (let i = 0; i < listings.length; i++) {
    result.push({ type: "listing", data: listings[i] });

    const positionAfter = i + 1;

    if (ad && positionAfter % AD_FREQUENCY === 0) {
      result.push({ type: "ad", data: ad });
    }

    if (vendors.length > 0 && positionAfter % VENDOR_FREQUENCY === 0) {
      const vendorIndex = Math.floor(i / VENDOR_FREQUENCY) % vendors.length;
      result.push({ type: "vendor", data: vendors[vendorIndex] });
    }
  }

  return result;
}

/**
 * Stable key extractor compatible with both FlashList and FlatList.
 * Each key is prefixed by type to prevent collisions when the same
 * resource appears in multiple type slots.
 */
export function feedKeyExtractor(item: FeedItem, index: number): string {
  switch (item.type) {
    case "listing": return `l-${item.data.id}`;
    case "vendor":  return `v-${item.data.id}`;
    case "ad":      return `a-${item.data.id}-${index}`;
    case "banner":  return `b-${item.data.id}`;
  }
}

/**
 * Maps a FeedItem to its type string for FlashList's `getItemType`.
 * Returning distinct values per type lets FlashList pool ViewHolders
 * separately, eliminating costly layout re-calculation on scroll.
 */
export function getFeedItemType(item: FeedItem): string {
  return item.type;
}
