"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getSystemHealth } from "../../../src/lib/admin-api";

interface ServiceHealth {
  name: string;
  status: string;
  latency: number;
  uptime: string;
  lastCheck: string;
  details?: string;
}

interface SystemHealthData {
  services: ServiceHealth[];
  postgres: { connected: boolean; poolSize: number; activeConnections: number; responseMs: number };
  mongodb:  { connected: boolean; collections: number; responseMs: number };
  redis:    { connected: boolean; memoryUsedMb: number; hitRate: number; responseMs: number };
  api:      { requestsPerMin: number; avgResponseMs: number; errorRate: number };
}

export default function AdminSystemMonitoringPage() {
  const [health, setHealth]   = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSystemHealth();
      setHealth(data as SystemHealthData);
    } catch {
      setError("Failed to load system health data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const iv = setInterval(load, 30_000);
    return () => clearInterval(iv);
  }, [load]);

  const dot = (ok: boolean) => (
    <span className={`inline-block w-2.5 h-2.5 rounded-full mr-2 ${ok ? "bg-green-500" : "bg-red-500"}`} />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">System Monitoring</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Database health, API performance, and service status
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="px-4 py-2 text-sm bg-[var(--color-primary)] text-white rounded-lg disabled:opacity-50"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {health && (
        <>
          {/* Database Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* PostgreSQL */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
              <div className="flex items-center">
                {dot(health.postgres.connected)}
                <h3 className="font-semibold text-[var(--color-text)]">PostgreSQL</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Pool Size</dt>
                  <dd className="font-medium">{health.postgres.poolSize}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Active</dt>
                  <dd className="font-medium">{health.postgres.activeConnections}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Latency</dt>
                  <dd className="font-medium">{health.postgres.responseMs} ms</dd>
                </div>
              </dl>
            </div>

            {/* MongoDB */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
              <div className="flex items-center">
                {dot(health.mongodb.connected)}
                <h3 className="font-semibold text-[var(--color-text)]">MongoDB</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Collections</dt>
                  <dd className="font-medium">{health.mongodb.collections}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Latency</dt>
                  <dd className="font-medium">{health.mongodb.responseMs} ms</dd>
                </div>
              </dl>
            </div>

            {/* Redis */}
            <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
              <div className="flex items-center">
                {dot(health.redis.connected)}
                <h3 className="font-semibold text-[var(--color-text)]">Redis Cache</h3>
              </div>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Memory</dt>
                  <dd className="font-medium">{health.redis.memoryUsedMb} MB</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Hit Rate</dt>
                  <dd className="font-medium">{health.redis.hitRate}%</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--color-text-muted)]">Latency</dt>
                  <dd className="font-medium">{health.redis.responseMs} ms</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* API Performance */}
          <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-[var(--color-text)]">API Performance</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-[var(--color-text-muted)]">Requests / min</span>
                <p className="text-xl font-bold text-[var(--color-text)]">{health.api.requestsPerMin}</p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Avg Response</span>
                <p className="text-xl font-bold text-[var(--color-text)]">{health.api.avgResponseMs} ms</p>
              </div>
              <div>
                <span className="text-[var(--color-text-muted)]">Error Rate</span>
                <p className={`text-xl font-bold ${health.api.errorRate > 5 ? "text-red-600" : "text-green-600"}`}>
                  {health.api.errorRate}%
                </p>
              </div>
            </div>
          </div>

          {/* Service Health Table */}
          <h2 className="text-lg font-semibold text-[var(--color-text)]">Service Health</h2>
          <DataTable
            loading={loading}
            data={(health.services ?? []) as unknown as Record<string, unknown>[]}
            emptyMessage="No services registered."
            columns={[
              { key: "name", header: "Service",
                render: (row) => (
                  <span className="font-semibold">{String(row["name"])}</span>
                ),
              },
              { key: "status", header: "Status",
                render: (row) => <StatusBadge status={String(row["status"])} />,
              },
              { key: "latency", header: "Latency",
                render: (row) => (
                  <span className="text-sm">{Number(row["latency"])} ms</span>
                ),
              },
              { key: "uptime", header: "Uptime" },
              { key: "lastCheck", header: "Last Check",
                render: (row) => (
                  <span className="text-xs whitespace-nowrap">
                    {new Date(String(row["lastCheck"])).toLocaleString("en-UG")}
                  </span>
                ),
              },
              { key: "details", header: "Details",
                render: (row) => (
                  <span className="text-xs text-[var(--color-text-muted)]">
                    {row["details"] ? String(row["details"]) : "—"}
                  </span>
                ),
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
