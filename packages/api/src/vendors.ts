import type { AxiosInstance } from "axios";
import type { VendorProfile, VendorStats } from "@jefflink/types";

export function createVendorsApi(client: AxiosInstance) {
  return {
    async getById(id: string): Promise<VendorProfile> {
      const { data } = await client.get(`/vendors/${id}`);
      return data;
    },

    async getStats(id: string): Promise<VendorStats> {
      const { data } = await client.get(`/vendors/${id}/stats`);
      return data;
    },

    async getAll(params?: { page?: number; limit?: number }): Promise<VendorProfile[]> {
      const { data } = await client.get("/vendors", { params });
      return data;
    },
  };
}
