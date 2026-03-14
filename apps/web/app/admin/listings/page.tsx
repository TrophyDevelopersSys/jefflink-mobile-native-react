"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "../../../src/components/admin/DataTable";
import {
  getPendingVehicles,
  approveVehicle,
  rejectVehicle,
  getPendingProperties,
  approveProperty,
  rejectProperty,
} from "../../../src/lib/admin-api";

type Tab = "vehicles" | "properties";

interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  price: string;
  ownerId: string;
  createdAt: string;
}

interface Property {
  id: string;
  title: string;
  type: string;
  price: string;
  location: string;
  ownerId: string;
  createdAt: string;
}

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

export default function AdminListingsPage() {
  const [tab, setTab]           = useState<Tab>("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [acting, setActing]     = useState<string | null>(null);

  const loadVehicles = useCallback(async () => {
    const data = await getPendingVehicles();
    setVehicles(Array.isArray(data) ? data : (data as { data: Vehicle[] }).data ?? []);
  }, []);

  const loadProperties = useCallback(async () => {
    const data = await getPendingProperties();
    setProperties(Array.isArray(data) ? data : (data as { data: Property[] }).data ?? []);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([loadVehicles(), loadProperties()]);
    } catch {
      setError("Failed to load pending listings.");
    } finally {
      setLoading(false);
    }
  }, [loadVehicles, loadProperties]);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function handleVehicle(id: string, action: "approve" | "reject") {
    setActing(id);
    const reason = action === "reject" ? window.prompt("Rejection reason:") : undefined;
    if (action === "reject" && !reason) { setActing(null); return; }
    try {
      if (action === "approve") await approveVehicle(id);
      else                       await rejectVehicle(id, reason!);
      await loadVehicles();
    } catch {
      setError("Action failed.");
    } finally {
      setActing(null);
    }
  }

  async function handleProperty(id: string, action: "approve" | "reject") {
    setActing(id);
    const reason = action === "reject" ? window.prompt("Rejection reason:") : undefined;
    if (action === "reject" && !reason) { setActing(null); return; }
    try {
      if (action === "approve") await approveProperty(id);
      else                       await rejectProperty(id, reason!);
      await loadProperties();
    } catch {
      setError("Action failed.");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Listings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Review and moderate pending listings
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {(["vehicles", "properties"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t}
            {t === "vehicles" && (
              <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                {vehicles.length}
              </span>
            )}
            {t === "properties" && (
              <span className="ml-1.5 text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                {properties.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {tab === "vehicles" && (
        <DataTable
          loading={loading}
          data={vehicles as unknown as Record<string, unknown>[]}
          emptyMessage="No pending vehicles."
          columns={[
            { key: "make",  header: "Make" },
            { key: "model", header: "Model" },
            { key: "year",  header: "Year" },
            { key: "price", header: "Price",
              render: (row) => fmt(String(row["price"])),
            },
            { key: "createdAt", header: "Submitted",
              render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
            },
            { key: "actions", header: "",
              render: (row) => {
                const id = String(row["id"]);
                const busy = acting === id;
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVehicle(id, "approve")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleVehicle(id, "reject")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Reject"}
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      )}

      {tab === "properties" && (
        <DataTable
          loading={loading}
          data={properties as unknown as Record<string, unknown>[]}
          emptyMessage="No pending properties."
          columns={[
            { key: "title",    header: "Title" },
            { key: "type",     header: "Type" },
            { key: "location", header: "Location",
              render: (row) => <span>{row["location"] ? String(row["location"]) : "—"}</span>,
            },
            { key: "price", header: "Price",
              render: (row) => fmt(String(row["price"])),
            },
            { key: "createdAt", header: "Submitted",
              render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
            },
            { key: "actions", header: "",
              render: (row) => {
                const id = String(row["id"]);
                const busy = acting === id;
                return (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleProperty(id, "approve")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Approve"}
                    </button>
                    <button
                      onClick={() => handleProperty(id, "reject")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Reject"}
                    </button>
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </div>
  );
}
