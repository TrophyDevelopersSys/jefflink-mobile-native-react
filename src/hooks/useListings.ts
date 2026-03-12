import { useCallback } from "react";
import { listingsApi } from "../api/listings.api";
import { useListingStore } from "../store/listing.store";

export const useListings = () => {
  const { listings, setListings } = useListingStore();

  const loadVehicleListings = useCallback(async () => {
    const data = await listingsApi.listVehicles();
    setListings(data);
  }, [setListings]);

  const loadPropertyListings = useCallback(async () => {
    const data = await listingsApi.listProperties();
    setListings(data);
  }, [setListings]);

  return { listings, loadVehicleListings, loadPropertyListings };
};
