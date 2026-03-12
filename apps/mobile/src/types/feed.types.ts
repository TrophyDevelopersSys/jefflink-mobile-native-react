import type { ListingSummary } from "./listing.types";
import type { AdBanner } from "./ad";
import type { VendorCardItem } from "../components/cards/VendorCard";

/** Full-width promotional banner injected into the feed. */
export type PromoBanner = {
  id: string;
  title: string;
  subtitle?: string;
  image: string;
  cta: string;
  targetUrl: string;
  backgroundColor?: string;
};

/**
 * Discriminated union representing every item type that can appear in the
 * marketplace feed. Add new variants here as the product grows.
 */
export type FeedItem =
  | { type: "listing"; data: ListingSummary }
  | { type: "vendor";  data: VendorCardItem }
  | { type: "ad";      data: AdBanner }
  | { type: "banner";  data: PromoBanner };

/**
 * Shape of a single page returned from the paginated listings API.
 * Backend endpoint: GET /listings?cursor=<token>&limit=<n>&type=<featured|recent>
 */
export interface ListingPage {
  items: ListingSummary[];
  /** Opaque cursor for the next page, or null when the last page is reached. */
  nextCursor: string | null;
  hasMore: boolean;
}
