import { create } from "zustand";
import type { ListingSummary } from "../types/listing.types";

interface ListingState {
  listings: ListingSummary[];
  setListings: (listings: ListingSummary[]) => void;
}

export const useListingStore = create<ListingState>((set) => ({
  listings: [],
  setListings: (listings) => set({ listings })
}));
