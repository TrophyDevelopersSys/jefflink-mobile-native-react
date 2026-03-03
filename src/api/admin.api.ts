import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { ContractSummary } from "../types/contract.types";
import type { PaymentRecord } from "../types/payment.types";
import type { UserProfile } from "../types/user.types";

export const adminApi = {
  async listUsers(): Promise<UserProfile[]> {
    const response = await apiClient.get(endpoints.admin.users);
    return response.data as UserProfile[];
  },
  async listContracts(): Promise<ContractSummary[]> {
    const response = await apiClient.get(endpoints.admin.contracts);
    return response.data as ContractSummary[];
  },
  async listPayments(): Promise<PaymentRecord[]> {
    const response = await apiClient.get(endpoints.admin.payments);
    return response.data as PaymentRecord[];
  },
  async listRecoveryQueue(): Promise<ContractSummary[]> {
    const response = await apiClient.get(endpoints.admin.recovery);
    return response.data as ContractSummary[];
  },
  async getSyncStatus(): Promise<{ status: string; lastSyncAt?: string }> {
    const response = await apiClient.get(endpoints.admin.sync);
    return response.data as { status: string; lastSyncAt?: string };
  }
};
