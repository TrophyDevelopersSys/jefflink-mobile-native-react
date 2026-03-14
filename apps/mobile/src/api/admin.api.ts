import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type { ContractSummary } from "../types/contract.types";
import type { PaymentRecord } from "../types/payment.types";
import type { UserProfile } from "../types/user.types";

// ── Neon-backed admin API ─────────────────────────────────────────────────────

export const adminApi = {
  // Dashboard
  async getDashboardStats(): Promise<{
    users: { total: number; newThisMonth: number };
    vehicles: { total: number; available: number };
    contracts: { total: number; active: number };
    revenue: { monthly: number; total: number; successfulPayments: number };
  }> {
    const r = await apiClient.get(endpoints.admin.dashboard);
    return (r.data?.data ?? r.data) as ReturnType<typeof adminApi.getDashboardStats> extends Promise<infer T> ? T : never;
  },

  async getRecentActivity(limit = 10): Promise<Array<{
    id: string; adminId: string; action: string;
    entityType?: string; entityId?: string; createdAt: string;
  }>> {
    const r = await apiClient.get(endpoints.admin.analyticsActivity, { params: { limit } });
    return (r.data?.data ?? r.data) as never;
  },

  async getRevenueTimeline(): Promise<Array<{ month: string; revenue: string; count: string }>> {
    const r = await apiClient.get(endpoints.admin.analyticsRevenue);
    return (r.data?.data ?? r.data) as never;
  },

  // Users
  async listUsers(page = 1, limit = 20, search?: string): Promise<UserProfile[]> {
    const r = await apiClient.get(endpoints.admin.users, { params: { page, limit, search } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as UserProfile[];
  },

  async updateUserStatus(
    id: string,
    status: "ACTIVE" | "SUSPENDED" | "BANNED",
    reason?: string,
  ): Promise<void> {
    await apiClient.patch(endpoints.admin.userStatus(id), { status, reason });
  },

  // Vendors
  async listVendors(page = 1, limit = 20): Promise<unknown[]> {
    const r = await apiClient.get(endpoints.admin.vendors, { params: { page, limit } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as unknown[];
  },

  async verifyVendor(id: string, note?: string): Promise<void> {
    await apiClient.patch(endpoints.admin.vendorVerify(id), { note });
  },

  async suspendVendor(id: string, reason: string): Promise<void> {
    await apiClient.patch(endpoints.admin.vendorSuspend(id), { reason });
  },

  // Listings
  async getPendingVehicles(page = 1): Promise<unknown[]> {
    const r = await apiClient.get(endpoints.admin.pendingVehicles, { params: { page } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as unknown[];
  },

  async approveVehicle(id: string, note?: string): Promise<void> {
    await apiClient.patch(endpoints.admin.approveVehicle(id), { note });
  },

  async rejectVehicle(id: string, reason: string): Promise<void> {
    await apiClient.patch(endpoints.admin.rejectVehicle(id), { reason });
  },

  async getPendingProperties(page = 1): Promise<unknown[]> {
    const r = await apiClient.get(endpoints.admin.pendingProperties, { params: { page } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as unknown[];
  },

  async approveProperty(id: string, note?: string): Promise<void> {
    await apiClient.patch(endpoints.admin.approveProperty(id), { note });
  },

  async rejectProperty(id: string, reason: string): Promise<void> {
    await apiClient.patch(endpoints.admin.rejectProperty(id), { reason });
  },

  // Reports
  async listReports(
    page = 1,
    status?: "OPEN" | "RESOLVED" | "DISMISSED",
  ): Promise<unknown[]> {
    const r = await apiClient.get(endpoints.admin.reports, { params: { page, status } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as unknown[];
  },

  async resolveReport(
    id: string,
    resolution: "RESOLVED" | "DISMISSED",
    resolutionNote: string,
  ): Promise<void> {
    await apiClient.patch(endpoints.admin.resolveReport(id), { resolution, resolutionNote });
  },

  // Finance
  async getFinanceSummary(): Promise<unknown> {
    const r = await apiClient.get(endpoints.admin.financeSummary);
    return r.data?.data ?? r.data;
  },

  async listContracts(page = 1): Promise<ContractSummary[]> {
    const r = await apiClient.get(endpoints.admin.contracts, { params: { page } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as ContractSummary[];
  },

  async listPayments(page = 1): Promise<PaymentRecord[]> {
    const r = await apiClient.get(endpoints.admin.payments, { params: { page } });
    return ((r.data?.data ?? r.data)?.data ?? r.data?.data ?? r.data) as PaymentRecord[];
  },

  // Legacy / sync
  async listRecoveryQueue(): Promise<ContractSummary[]> {
    const r = await apiClient.get(endpoints.admin.recovery);
    return r.data as ContractSummary[];
  },

  async getSyncStatus(): Promise<{ status: string; lastSyncAt?: string }> {
    const r = await apiClient.get(endpoints.admin.sync);
    return r.data as { status: string; lastSyncAt?: string };
  },
};
