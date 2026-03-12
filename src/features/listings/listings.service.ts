import { listingsService } from "./service";
import type { ListingSummary } from "../../types/listing.types";

type ListingFeedType = "featured" | "recent";

type ListingResponse = {
  items: ListingSummary[];
};

const mapResponse = (items: ListingSummary[], type: ListingFeedType): ListingResponse => {
  if (type === "recent") {
    return { items: items.slice().reverse().slice(0, 8) };
  }

  return { items: items.slice(0, 8) };
};

export const listingsFeedService = {
  async getListings(type: ListingFeedType): Promise<ListingResponse> {
    const items = await listingsService.listVehicles();
    return mapResponse(items, type);
  }
};
