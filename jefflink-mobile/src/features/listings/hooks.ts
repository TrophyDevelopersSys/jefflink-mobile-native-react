import { useCallback, useState } from "react";
import type { ListingDetail, ListingSummary } from "../../types/listing.types";
import { listingsService } from "./service";

type ListingsAsyncState = {
  loading: boolean;
  error: string | null;
};

export function useListingsFeature() {
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [selected, setSelected] = useState<ListingDetail | null>(null);
  const [state, setState] = useState<ListingsAsyncState>({
    loading: false,
    error: null
  });

  const loadVehicles = useCallback(async (params?: import("../../api/listings.api").ListingsSearchParams) => {
    setState({ loading: true, error: null });
    try {
      const data = params && Object.keys(params).length > 0
        ? await listingsService.search(params)
        : await listingsService.listVehicles();
      setListings(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load vehicles"
      });
    }
  }, []);

  const loadProperties = useCallback(async () => {
    setState({ loading: true, error: null });
    try {
      const data = await listingsService.listProperties();
      setListings(data);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error:
          error instanceof Error ? error.message : "Failed to load properties"
      });
    }
  }, []);

  const loadListing = useCallback(async (id: string) => {
    setState({ loading: true, error: null });
    try {
      const detail = await listingsService.getListing(id);
      setSelected(detail);
      setState({ loading: false, error: null });
    } catch (error) {
      setState({
        loading: false,
        error: error instanceof Error ? error.message : "Failed to load listing"
      });
    }
  }, []);

  return {
    listings,
    selected,
    loadVehicles,
    loadProperties,
    loadListing,
    ...state
  };
}
