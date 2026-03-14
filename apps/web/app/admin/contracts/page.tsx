"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminContracts } from "../../../src/lib/admin-api";

interface Contract {
  id: string;
  buyerId: string;
  vehicleId?: string;
  propertyId?: string;
  totalAmount: string;
  status: string;
  startDate?: string;
  createdAt: string;
}

interface ContractsPage {
  data: Contract[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 20;

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

export default function AdminContractsPage() {
  const [page, setPage]       = useState(1);
  const [result, setResult]   = useState<ContractsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminContracts(page, PAGE_LIMIT);
      setResult(data as ContractsPage);
    } catch {
      setError("Failed to load contracts.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Contracts</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            View all financing contracts
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {result?.total ?? 0} total
        </span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={(result?.data ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No contracts found."
        columns={[
          { key: "id", header: "Contract ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["id"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "buyerId", header: "Buyer",
            render: (row) => (
              <span className="font-mono text-xs">{String(row["buyerId"]).slice(0, 8)}…</span>
            ),
          },
          { key: "listing", header: "Listing",
            render: (row) => {
              if (row["vehicleId"]) return <span className="text-xs">Vehicle</span>;
              if (row["propertyId"]) return <span className="text-xs">Property</span>;
              return <span className="text-xs text-[var(--color-text-muted)]">—</span>;
            },
          },
          { key: "totalAmount", header: "Total Amount",
            render: (row) => (
              <span className="font-semibold">{fmt(String(row["totalAmount"]))}</span>
            ),
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
          },
          { key: "startDate", header: "Start Date",
            render: (row) =>
              row["startDate"]
                ? new Date(String(row["startDate"])).toLocaleDateString("en-UG")
                : "—",
          },
          { key: "createdAt", header: "Created",
            render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
          },
        ]}
      />

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
