"use client";

import React, { useEffect, useState, useCallback } from "react";
import { StatsCard } from "../../../src/components/admin/StatsCard";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import {
  getDashboardStats,
  getRecentActivity,
  getRevenueTimeline,
} from "../../../src/lib/admin-api";

// ── Types ──────────────────────────────────────────────────────────────────────

interface DashboardStats {
  users:     { total: number; newThisMonth: number };
  vehicles:  { total: number; available: number };
  contracts: { total: number; active: number };
  revenue:   { monthly: number; total: number; successfulPayments: number };
}

interface ActivityLog {
  id: string;
  adminId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  createdAt: string;
}

interface RevenuePoint {
  month: string;
  revenue: string;
  count: string;
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(n);

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats]       = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [revenue, setRevenue]   = useState<RevenuePoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, a, r] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(10),
        getRevenueTimeline(),
      ]);
      setStats(s);
      setActivity(Array.isArray(a) ? a : []);
      setRevenue(Array.isArray(r) ? r : []);
    } catch {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Dashboard</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Platform overview — JeffLink Marketplace
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Users"
          value={loading ? "…" : (stats?.users.total ?? 0).toLocaleString()}
          sub={loading ? undefined : `+${stats?.users.newThisMonth ?? 0} this month`}
          trend="up"
          icon="👥"
        />
        <StatsCard
          label="Active Contracts"
          value={loading ? "…" : (stats?.contracts.active ?? 0).toLocaleString()}
          sub={loading ? undefined : `${stats?.contracts.total ?? 0} total`}
          icon="📄"
        />
        <StatsCard
          label="Vehicles Listed"
          value={loading ? "…" : (stats?.vehicles.total ?? 0).toLocaleString()}
          sub={loading ? undefined : `${stats?.vehicles.available ?? 0} available`}
          icon="🚗"
        />
        <StatsCard
          label="Monthly Revenue"
          value={loading ? "…" : fmt(stats?.revenue.monthly ?? 0)}
          sub={loading ? undefined : `${stats?.revenue.successfulPayments ?? 0} payments`}
          trend="up"
          icon="💰"
        />
      </div>

      {/* Revenue timeline */}
      {revenue.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">
            Revenue — Last 6 Months
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {revenue.map((point) => (
              <div
                key={point.month}
                className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-lg p-3 text-center"
              >
                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                  {point.month}
                </p>
                <p className="text-sm font-bold text-[var(--color-text)] mt-1">
                  {fmt(Number(point.revenue))}
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {point.count} payments
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent admin activity */}
      <section>
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">
          Recent Admin Activity
        </h2>
        <DataTable
          loading={loading}
          data={activity as unknown as Record<string, unknown>[]}
          emptyMessage="No recent activity."
          columns={[
            {
              key: "action",
              header: "Action",
              render: (row) => (
                <span className="font-mono text-xs bg-[var(--color-border)] px-2 py-0.5 rounded">
                  {String(row["action"])}
                </span>
              ),
            },
            { key: "entityType", header: "Entity Type" },
            { key: "entityId",   header: "Entity ID",
              render: (row) => (
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {row["entityId"] ? String(row["entityId"]).slice(0, 8) + "…" : "—"}
                </span>
              ),
            },
            {
              key: "createdAt",
              header: "When",
              render: (row) =>
                new Date(String(row["createdAt"])).toLocaleString("en-UG"),
            },
          ]}
        />
      </section>
    </div>
  );
}
