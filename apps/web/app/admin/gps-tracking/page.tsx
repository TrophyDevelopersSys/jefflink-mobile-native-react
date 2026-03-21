"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getGpsDevices } from "../../../src/lib/admin-api";

type Tab = "devices" | "alerts" | "recovery";

interface GpsDevice {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  imei: string;
  status: string;
  lastPing: string;
  lat: number;
  lng: number;
  speed: number;
  battery: number;
}

interface GpsAlert {
  id: string;
  deviceId: string;
  vehiclePlate: string;
  alertType: string;
  message: string;
  severity: string;
  createdAt: string;
  acknowledged: boolean;
}

interface RecoveryCase {
  id: string;
  vehiclePlate: string;
  contractId: string;
  status: string;
  reason: string;
  assignedTo: string;
  openedAt: string;
  closedAt?: string;
}

interface GpsResult {
  devices:  { data: GpsDevice[];  total: number };
  alerts:   { data: GpsAlert[];   total: number };
  recovery: { data: RecoveryCase[]; total: number };
}

const PAGE_LIMIT = 25;

export default function AdminGpsTrackingPage() {
  const [tab, setTab]         = useState<Tab>("devices");
  const [result, setResult]   = useState<GpsResult | null>(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getGpsDevices(tab, page, PAGE_LIMIT);
      setResult(data as GpsResult);
    } catch {
      setError("Failed to load GPS data.");
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [tab]);

  const activeSet = tab === "devices"
    ? result?.devices
    : tab === "alerts"
    ? result?.alerts
    : result?.recovery;
  const totalPages = activeSet ? Math.ceil(activeSet.total / PAGE_LIMIT) : 1;

  const TABS: { key: Tab; label: string }[] = [
    { key: "devices",  label: "Device Status" },
    { key: "alerts",   label: "Geofence Alerts" },
    { key: "recovery", label: "Recovery Tracking" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">GPS Tracking &amp; Recovery</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Device monitoring, geofence alerts, and asset recovery
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[var(--color-border)]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Devices tab */}
      {tab === "devices" && (
        <DataTable
          loading={loading}
          data={(result?.devices?.data ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No GPS devices found."
          columns={[
            { key: "vehiclePlate", header: "Vehicle",
              render: (row) => (
                <span className="font-semibold">{String(row["vehiclePlate"])}</span>
              ),
            },
            { key: "imei", header: "IMEI",
              render: (row) => (
                <span className="font-mono text-xs">{String(row["imei"])}</span>
              ),
            },
            { key: "status", header: "Status",
              render: (row) => <StatusBadge status={String(row["status"])} />,
            },
            { key: "lat", header: "Location",
              render: (row) => (
                <span className="text-xs">
                  {Number(row["lat"]).toFixed(4)}, {Number(row["lng"]).toFixed(4)}
                </span>
              ),
            },
            { key: "speed", header: "Speed",
              render: (row) => (
                <span className="text-sm">{Number(row["speed"])} km/h</span>
              ),
            },
            { key: "battery", header: "Battery",
              render: (row) => {
                const b = Number(row["battery"]);
                const color = b > 50 ? "text-green-600" : b > 20 ? "text-yellow-600" : "text-red-600";
                return <span className={`text-sm font-semibold ${color}`}>{b}%</span>;
              },
            },
            { key: "lastPing", header: "Last Ping",
              render: (row) => (
                <span className="text-xs whitespace-nowrap">
                  {new Date(String(row["lastPing"])).toLocaleString("en-UG")}
                </span>
              ),
            },
          ]}
        />
      )}

      {/* Alerts tab */}
      {tab === "alerts" && (
        <DataTable
          loading={loading}
          data={(result?.alerts?.data ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No geofence alerts."
          columns={[
            { key: "vehiclePlate", header: "Vehicle" },
            { key: "alertType", header: "Alert Type",
              render: (row) => (
                <span className="text-xs uppercase font-medium tracking-wide">
                  {String(row["alertType"])}
                </span>
              ),
            },
            { key: "message", header: "Message",
              render: (row) => (
                <span className="text-xs text-[var(--color-text-muted)] max-w-[200px] truncate block">
                  {String(row["message"])}
                </span>
              ),
            },
            { key: "severity", header: "Severity",
              render: (row) => {
                const s = String(row["severity"]);
                const color = s === "CRITICAL"
                  ? "text-red-600 bg-red-50"
                  : s === "HIGH"
                  ? "text-orange-600 bg-orange-50"
                  : "text-yellow-700 bg-yellow-50";
                return (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}>{s}</span>
                );
              },
            },
            { key: "acknowledged", header: "Ack",
              render: (row) => (
                <span className={`text-xs font-medium ${row["acknowledged"] ? "text-green-600" : "text-red-500"}`}>
                  {row["acknowledged"] ? "Yes" : "No"}
                </span>
              ),
            },
            { key: "createdAt", header: "Date",
              render: (row) => (
                <span className="text-xs whitespace-nowrap">
                  {new Date(String(row["createdAt"])).toLocaleString("en-UG")}
                </span>
              ),
            },
          ]}
        />
      )}

      {/* Recovery tab */}
      {tab === "recovery" && (
        <DataTable
          loading={loading}
          data={(result?.recovery?.data ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No recovery cases."
          columns={[
            { key: "id", header: "Case ID",
              render: (row) => (
                <span className="font-mono text-xs">{String(row["id"]).slice(0, 8)}…</span>
              ),
            },
            { key: "vehiclePlate", header: "Vehicle" },
            { key: "reason", header: "Reason" },
            { key: "assignedTo", header: "Assigned To" },
            { key: "status", header: "Status",
              render: (row) => <StatusBadge status={String(row["status"])} />,
            },
            { key: "openedAt", header: "Opened",
              render: (row) => (
                <span className="text-xs whitespace-nowrap">
                  {new Date(String(row["openedAt"])).toLocaleString("en-UG")}
                </span>
              ),
            },
            { key: "closedAt", header: "Closed",
              render: (row) => (
                <span className="text-xs whitespace-nowrap">
                  {row["closedAt"] ? new Date(String(row["closedAt"])).toLocaleString("en-UG") : "—"}
                </span>
              ),
            },
          ]}
        />
      )}

      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-[var(--color-text-muted)]">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
