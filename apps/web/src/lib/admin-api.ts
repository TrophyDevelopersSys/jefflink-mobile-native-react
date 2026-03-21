/**
 * Admin API client for the Next.js web app.
 * All requests go to /api/v1/admin/* authenticated via the stored JWT.
 */
import axios from "axios";
import { webAuthAdapter } from "./authAdapter";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "https://api.jefflinkcars.com/api/v1";

const adminHttp = axios.create({ baseURL: `${BASE}/admin` });

adminHttp.interceptors.request.use(async (config) => {
  const token = await webAuthAdapter.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats() {
  const res = await adminHttp.get("/dashboard");
  return res.data?.data ?? res.data;
}

export async function getRevenueTimeline() {
  const res = await adminHttp.get("/analytics/revenue");
  return res.data?.data ?? res.data;
}

export async function getRecentActivity(limit = 10) {
  const res = await adminHttp.get("/analytics/activity", { params: { limit } });
  return res.data?.data ?? res.data;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export async function getAdminUsers(page = 1, limit = 20, search?: string) {
  const res = await adminHttp.get("/users", { params: { page, limit, search } });
  return res.data?.data ?? res.data;
}

export async function getAdminUser(id: string) {
  const res = await adminHttp.get(`/users/${id}`);
  return res.data?.data ?? res.data;
}

export async function updateUserStatus(
  id: string,
  status: "ACTIVE" | "SUSPENDED" | "BANNED",
  reason?: string,
) {
  const res = await adminHttp.patch(`/users/${id}/status`, { status, reason });
  return res.data?.data ?? res.data;
}

// ── Vendors ───────────────────────────────────────────────────────────────────

export async function getAdminVendors(page = 1, limit = 20) {
  const res = await adminHttp.get("/vendors", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function getAdminVendor(id: string) {
  const res = await adminHttp.get(`/vendors/${id}`);
  return res.data?.data ?? res.data;
}

export async function verifyVendor(id: string, note?: string) {
  const res = await adminHttp.patch(`/vendors/${id}/verify`, { note });
  return res.data?.data ?? res.data;
}

export async function suspendVendor(id: string, reason: string) {
  const res = await adminHttp.patch(`/vendors/${id}/suspend`, { reason });
  return res.data?.data ?? res.data;
}

// ── Listings ──────────────────────────────────────────────────────────────────

export async function getPendingVehicles(page = 1, limit = 20) {
  const res = await adminHttp.get("/listings/pending", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function approveVehicle(id: string, note?: string) {
  const res = await adminHttp.patch(`/listings/vehicles/${id}/approve`, { note });
  return res.data?.data ?? res.data;
}

export async function rejectVehicle(id: string, reason: string) {
  const res = await adminHttp.patch(`/listings/vehicles/${id}/reject`, { reason });
  return res.data?.data ?? res.data;
}

export async function getPendingProperties(page = 1, limit = 20) {
  const res = await adminHttp.get("/listings/properties/pending", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function approveProperty(id: string, note?: string) {
  const res = await adminHttp.patch(`/listings/properties/${id}/approve`, { note });
  return res.data?.data ?? res.data;
}

export async function rejectProperty(id: string, reason: string) {
  const res = await adminHttp.patch(`/listings/properties/${id}/reject`, { reason });
  return res.data?.data ?? res.data;
}

// ── Reports ───────────────────────────────────────────────────────────────────

export async function getAdminReports(
  page = 1,
  limit = 20,
  status?: "OPEN" | "RESOLVED" | "DISMISSED",
) {
  const res = await adminHttp.get("/reports", { params: { page, limit, status } });
  return res.data?.data ?? res.data;
}

export async function resolveReport(
  id: string,
  resolution: "RESOLVED" | "DISMISSED",
  resolutionNote: string,
) {
  const res = await adminHttp.patch(`/reports/${id}/resolve`, { resolution, resolutionNote });
  return res.data?.data ?? res.data;
}

// ── Finance ───────────────────────────────────────────────────────────────────

export async function getFinanceSummary() {
  const res = await adminHttp.get("/finance/summary");
  return res.data?.data ?? res.data;
}

export async function getAdminContracts(page = 1, limit = 20) {
  const res = await adminHttp.get("/contracts", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function getContractDetail(id: string) {
  const res = await adminHttp.get(`/contracts/${id}`);
  return res.data?.data ?? res.data;
}

export async function getAdminPayments(page = 1, limit = 20) {
  const res = await adminHttp.get("/payments", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function getAdminInstallments(page = 1, limit = 20, status?: string) {
  const res = await adminHttp.get("/installments", { params: { page, limit, status } });
  return res.data?.data ?? res.data;
}

export async function getAdminWithdrawals(page = 1, limit = 20) {
  const res = await adminHttp.get("/withdrawals", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

export async function approveWithdrawal(id: string) {
  const res = await adminHttp.patch(`/withdrawals/${id}/approve`);
  return res.data?.data ?? res.data;
}

export async function rejectWithdrawal(id: string, reason: string) {
  const res = await adminHttp.patch(`/withdrawals/${id}/reject`, { reason });
  return res.data?.data ?? res.data;
}

// ── Wallets ───────────────────────────────────────────────────────────────────

export async function getWalletsSummary() {
  const res = await adminHttp.get("/wallets/summary");
  return res.data?.data ?? res.data;
}

export async function getWalletTransactions(page = 1, limit = 25) {
  const res = await adminHttp.get("/wallets/transactions", { params: { page, limit } });
  return res.data?.data ?? res.data;
}

// ── Notifications & Requests ──────────────────────────────────────────────────

export async function getAdminNotifications(tab: string, page = 1, limit = 25) {
  const res = await adminHttp.get("/notifications", { params: { tab, page, limit } });
  return res.data?.data ?? res.data;
}

// ── GPS Tracking & Recovery ───────────────────────────────────────────────────

export async function getGpsDevices(tab: string, page = 1, limit = 25) {
  const res = await adminHttp.get("/gps", { params: { tab, page, limit } });
  return res.data?.data ?? res.data;
}

// ── System Monitoring ─────────────────────────────────────────────────────────

export async function getSystemHealth() {
  const res = await adminHttp.get("/system/health");
  return res.data?.data ?? res.data;
}

// ── Audit Logs ────────────────────────────────────────────────────────────────

export async function getAuditLogs(limit = 50) {
  const res = await adminHttp.get("/audit-logs", { params: { limit } });
  return res.data?.data ?? res.data;
}
// ── Platform Settings ─────────────────────────────────────────────────────

export async function getPlatformSettings() {
  const res = await adminHttp.get("/settings");
  return res.data?.data ?? res.data;
}

export async function updatePlatformSettings(settings: Record<string, unknown>) {
  const res = await adminHttp.patch("/settings", settings);
  return res.data?.data ?? res.data;
}