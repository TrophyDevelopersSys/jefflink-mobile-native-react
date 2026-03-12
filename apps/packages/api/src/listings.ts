import type { AxiosInstance } from "axios";
import type { ListingDetail, ListingSummary } from "@jefflink/types";

export interface ListingsApiOptions {
  page?: number;
  limit?: number;
  type?: "vehicle" | "property";
  location?: string;
}

export function createListingsApi(client: AxiosInstance) {
  return {
    async getAll(options: ListingsApiOptions = {}): Promise<ListingSummary[]> {
      const { data } = await client.get("/listings", { params: options });
      return data;
    },

    async getById(id: string): Promise<ListingDetail> {
      const { data } = await client.get(`/listings/${id}`);
      return data;
    },
  };
}
