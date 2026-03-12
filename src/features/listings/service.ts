import { listingsApi } from "../../api/listings.api";
import type { ListingDetail, ListingSummary } from "../../types/listing.types";

export const listingsService = {
	async listVehicles(): Promise<ListingSummary[]> {
		return listingsApi.listVehicles();
	},
	async listProperties(): Promise<ListingSummary[]> {
		return listingsApi.listProperties();
	},
	async getListing(id: string): Promise<ListingDetail> {
		return listingsApi.getListing(id);
	}
};
