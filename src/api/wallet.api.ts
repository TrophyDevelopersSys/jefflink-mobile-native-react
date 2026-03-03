import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { WalletOverview, WalletTransaction } from "../features/wallet/types";

export const walletApi = {
  async getOverview(): Promise<WalletOverview> {
    const response = await apiClient.get(endpoints.wallet.overview);
    return response.data as WalletOverview;
  },
  async listTransactions(): Promise<WalletTransaction[]> {
    const response = await apiClient.get(endpoints.wallet.transactions);
    return response.data as WalletTransaction[];
  }
};
