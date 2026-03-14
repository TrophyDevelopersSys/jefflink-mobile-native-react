"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminPayments } from "../../../src/lib/admin-api";

interface Payment {
  id: string;
  contractId?: string;
  amount: string;
  type: string;
  method: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

interface PaymentsPage {
  data: Payment[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 25;

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

export default function AdminPaymentsPage() {
  const [page, setPage]       = useState(1);
  const [result, setResult]   = useState<PaymentsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminPayments(page, PAGE_LIMIT);
      setResult(data as PaymentsPage);
    } catch {
      setError("Failed to load payments.");
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
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Payments</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            All payment transactions
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
        emptyMessage="No payments found."
        columns={[
          { key: "id", header: "Payment ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["id"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "contractId", header: "Contract",
            render: (row) =>
              row["contractId"] ? (
                <span className="font-mono text-xs">{String(row["contractId"]).slice(0, 8)}…</span>
              ) : (
                <span className="text-[var(--color-text-muted)]">—</span>
              ),
          },
          { key: "amount", header: "Amount",
            render: (row) => (
              <span className="font-semibold">{fmt(String(row["amount"]))}</span>
            ),
          },
          { key: "type", header: "Type",
            render: (row) => (
              <span className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                {String(row["type"])}
              </span>
            ),
          },
          { key: "method", header: "Method",
            render: (row) => (
              <span className="text-xs capitalize">{String(row["method"]).toLowerCase().replace(/_/g, " ")}</span>
            ),
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
          },
          { key: "paidAt", header: "Paid At",
            render: (row) =>
              row["paidAt"]
                ? new Date(String(row["paidAt"])).toLocaleString("en-UG")
                : "—",
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
