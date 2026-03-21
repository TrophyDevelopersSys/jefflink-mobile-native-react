"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminInstallments } from "../../../src/lib/admin-api";

interface Installment {
  id: string;
  contractId: string;
  amount: string;
  dueDate: string;
  paidDate?: string;
  status: string;
  createdAt: string;
}

interface InstallmentsPage {
  data: Installment[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 25;

const fmt = (n: string | number) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

const STATUS_OPTIONS = ["", "PENDING", "PAID", "OVERDUE", "DEFAULTED"] as const;

export default function AdminInstallmentsPage() {
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState<string>("");
  const [result, setResult]   = useState<InstallmentsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminInstallments(page, PAGE_LIMIT, status || undefined);
      setResult(data as InstallmentsPage);
    } catch {
      setError("Failed to load installments.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Installments</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Track hire-purchase installment schedules and payments
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {result?.total ?? 0} total
        </span>
      </div>

      {/* Status filter */}
      <div className="flex gap-2 items-center">
        <label className="text-sm text-[var(--color-text-muted)]">Status:</label>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          title="Filter by installment status"
          className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s || "All"}</option>
          ))}
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={(result?.data ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No installments found."
        columns={[
          { key: "id", header: "ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["id"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "contractId", header: "Contract",
            render: (row) => (
              <span className="font-mono text-xs">{String(row["contractId"]).slice(0, 8)}…</span>
            ),
          },
          { key: "amount", header: "Amount",
            render: (row) => (
              <span className="font-semibold">{fmt(String(row["amount"]))}</span>
            ),
          },
          { key: "dueDate", header: "Due Date",
            render: (row) =>
              row["dueDate"]
                ? new Date(String(row["dueDate"])).toLocaleDateString("en-UG")
                : "—",
          },
          { key: "paidDate", header: "Paid Date",
            render: (row) =>
              row["paidDate"]
                ? new Date(String(row["paidDate"])).toLocaleDateString("en-UG")
                : <span className="text-[var(--color-text-muted)]">—</span>,
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
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
