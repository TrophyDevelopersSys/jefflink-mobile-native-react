import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { ListingDetail, ListingSummary } from "../types/listing.types";

export const listingsApi = {
  async listVehicles(): Promise<ListingSummary[]> {
    const response = await apiClient.get(endpoints.listings.vehicles);
    return response.data as ListingSummary[];
  },
  async listProperties(): Promise<ListingSummary[]> {
    const response = await apiClient.get(endpoints.listings.properties);
    return response.data as ListingSummary[];
  },
  async getListing(id: string): Promise<ListingDetail> {
    const response = await apiClient.get(endpoints.listings.detail(id));
    return response.data as ListingDetail;
  }
};
