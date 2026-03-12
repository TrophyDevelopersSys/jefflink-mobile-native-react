import { useCallback, useRef, useState } from "react";
import type { ListingSummary } from "../../types/listing.types";
import { listingsFeedService } from "../listings/listings.service";

/**
 * How many items to show per virtual "page".
 * When the backend supports cursor pagination, swap this for the real
 * limit parameter: GET /listings?cursor=<token>&limit=PAGE_SIZE
 */
const PAGE_SIZE = 20;

interface FeedState {
  listings: ListingSummary[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
}

const INITIAL_STATE: FeedState = {
  listings: [],
  loading: false,
  refreshing: false,
  hasMore: true,
  error: null,
};

/**
 * `useFeed` manages paginated fetching of marketplace listings.
 *
 * Architecture notes:
 * - Currently wraps `listingsFeedService` which fetches a fixed local set.
 * - Ready for a real cursor-based API: replace `fetchPage`'s service call
 *   with `GET /listings?cursor=<cursor>&limit=PAGE_SIZE` when available.
 * - `isFetchingRef` prevents concurrent fetches without needing useReducer.
 * - All three returned functions (`loadInitial`, `loadMore`, `refresh`) are
 *   stable references suitable for passing to FlashList callbacks.
 */
export function useFeed() {
  const [state, setState] = useState<FeedState>(INITIAL_STATE);

  const isFetchingRef = useRef(false);
  const accumulatedRef = useRef<ListingSummary[]>([]);
  const pageRef = useRef(0);

  const fetchPage = useCallback(async (reset: boolean) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    setState((prev) => ({
      ...prev,
      loading: !reset,
      refreshing: reset,
      error: null,
    }));

    try {
      // TODO: replace with paginated API call:
      //   const response = await api.get(`/listings?cursor=${cursor}&limit=${PAGE_SIZE}`)
      const response = await listingsFeedService.getListings("featured");

      if (reset) {
        accumulatedRef.current = [];
        pageRef.current = 0;
      }

      pageRef.current += 1;
      const page = pageRef.current;
      const offset = (page - 1) * PAGE_SIZE;
      const pageSlice = response.items.slice(offset, offset + PAGE_SIZE);
      const combined = reset
        ? pageSlice
        : [...accumulatedRef.current, ...pageSlice];
      accumulatedRef.current = combined;

      setState({
        listings: combined,
        loading: false,
        refreshing: false,
        hasMore: response.items.length > page * PAGE_SIZE,
        error: null,
      });
    } catch (err) {
      setState((prev) => ({
        ...prev,
        loading: false,
        refreshing: false,
        error: err instanceof Error ? err.message : "Failed to load listings",
      }));
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const loadInitial = useCallback(() => fetchPage(true), [fetchPage]);

  const loadMore = useCallback(() => {
    if (!state.hasMore || isFetchingRef.current) return;
    fetchPage(false);
  }, [state.hasMore, fetchPage]);

  const refresh = useCallback(() => fetchPage(true), [fetchPage]);

  return { ...state, loadInitial, loadMore, refresh };
}
