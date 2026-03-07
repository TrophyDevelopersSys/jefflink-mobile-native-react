import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { ListingDetail, ListingSummary } from "../types/listing.types";

export type ListingsSearchParams = {
  propertyType?: string;
  seller?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
};

export const listingsApi = {
  async listVehicles(): Promise<ListingSummary[]> {
    const response = await apiClient.get(endpoints.listings.vehicles);
    return response.data as ListingSummary[];
  },
  async listProperties(): Promise<ListingSummary[]> {
    const response = await apiClient.get(endpoints.listings.properties);
    return response.data as ListingSummary[];
  },
  async search(params: ListingsSearchParams): Promise<ListingSummary[]> {
    const qs = new URLSearchParams();
    if (params.propertyType) qs.set("type", params.propertyType);
    if (params.seller && params.seller !== "all") qs.set("seller", params.seller);
    if (params.location) qs.set("location", params.location);
    if (params.priceMin != null) qs.set("priceMin", String(params.priceMin));
    if (params.priceMax != null) qs.set("priceMax", String(params.priceMax));
    const url = `${endpoints.listings.search}?${qs.toString()}`;
    const response = await apiClient.get(url);
    return response.data as ListingSummary[];
  },
  async getListing(id: string): Promise<ListingDetail> {
    const response = await apiClient.get(endpoints.listings.detail(id));
    return response.data as ListingDetail;
  }
};
