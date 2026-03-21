"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import {
  getAdminWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} from "../../../src/lib/admin-api";

interface Withdrawal {
  id: string;
  vendorId: string;
  amount: string;
  status: string;
  requestedAt: string;
  processedAt?: string;
}

interface WithdrawalsPage {
  data: Withdrawal[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 25;

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

export default function AdminWithdrawalsPage() {
  const [page, setPage]       = useState(1);
  const [result, setResult]   = useState<WithdrawalsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [acting, setActing]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminWithdrawals(page, PAGE_LIMIT);
      setResult(data as WithdrawalsPage);
    } catch {
      setError("Failed to load withdrawals.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  async function handleApprove(id: string) {
    setActing(id);
    try {
      await approveWithdrawal(id);
      await load();
    } catch {
      setError("Approval failed.");
    } finally {
      setActing(null);
    }
  }

  async function handleReject(id: string) {
    const reason = window.prompt("Rejection reason:");
    if (!reason) return;
    setActing(id);
    try {
      await rejectWithdrawal(id, reason);
      await load();
    } catch {
      setError("Rejection failed.");
    } finally {
      setActing(null);
    }
  }

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Withdrawals</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Vendor payout requests — approve or reject
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
        emptyMessage="No withdrawal requests."
        columns={[
          { key: "id", header: "ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["id"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "vendorId", header: "Vendor",
            render: (row) => (
              <span className="font-mono text-xs">{String(row["vendorId"]).slice(0, 8)}…</span>
            ),
          },
          { key: "amount", header: "Amount",
            render: (row) => (
              <span className="font-semibold">{fmt(String(row["amount"]))}</span>
            ),
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
          },
          { key: "requestedAt", header: "Requested",
            render: (row) =>
              row["requestedAt"]
                ? new Date(String(row["requestedAt"])).toLocaleString("en-UG")
                : "—",
          },
          { key: "actions", header: "",
            render: (row) => {
              const id = String(row["id"]);
              const st = String(row["status"]);
              const busy = acting === id;
              if (st !== "PENDING") return null;
              return (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleApprove(id)}
                    disabled={busy}
                    className="text-xs px-2.5 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                  >
                    {busy ? "…" : "Approve"}
                  </button>
                  <button
                    onClick={() => handleReject(id)}
                    disabled={busy}
                    className="text-xs px-2.5 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {busy ? "…" : "Reject"}
                  </button>
                </div>
              );
            },
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
