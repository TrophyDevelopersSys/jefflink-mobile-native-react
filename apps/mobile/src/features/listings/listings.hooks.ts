import { useEffect, useState } from "react";
import type { ListingSummary } from "../../types/listing.types";
import { listingsFeedService } from "./listings.service";

type ListingFeedType = "featured" | "recent";

type ListingFeedState = {
  listings: ListingSummary[];
  loading: boolean;
  error: string | null;
};

export function useListings(type: ListingFeedType): ListingFeedState {
  const [state, setState] = useState<ListingFeedState>({
    listings: [],
    loading: true,
    error: null
  });

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const response = await listingsFeedService.getListings(type);
        if (!active) return;
        setState({ listings: response.items, loading: false, error: null });
      } catch (error) {
        if (!active) return;
        setState({
          listings: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Failed to load listings"
        });
      }
    };

    setState((prev) => ({ ...prev, loading: true, error: null }));
    load();

    return () => {
      active = false;
    };
  }, [type]);

  return state;
}
