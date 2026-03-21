"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "../../../src/components/admin/DataTable";
import { getWalletsSummary, getWalletTransactions } from "../../../src/lib/admin-api";
import { StatsCard } from "../../../src/components/admin/StatsCard";

interface WalletSummary {
  buyerWallets:  { count: number; totalBalance: number };
  vendorWallets: { count: number; totalBalance: number; totalEarnings: number };
  systemWallet:  { revenue: number; fees: number };
}

interface WalletTx {
  id: string;
  walletOwnerId: string;
  ownerType: string;
  type: string;
  amount: string;
  balance: string;
  description?: string;
  createdAt: string;
}

interface TxPage {
  data: WalletTx[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 25;

const fmt = (n: number | string) =>
  new Intl.NumberFormat("en-UG", { style: "currency", currency: "UGX", maximumFractionDigits: 0 }).format(Number(n));

export default function AdminWalletsPage() {
  const [summary, setSummary]   = useState<WalletSummary | null>(null);
  const [txResult, setTxResult] = useState<TxPage | null>(null);
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [s, tx] = await Promise.all([
        getWalletsSummary(),
        getWalletTransactions(page, PAGE_LIMIT),
      ]);
      setSummary(s as WalletSummary);
      setTxResult(tx as TxPage);
    } catch {
      setError("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = txResult ? Math.ceil(txResult.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Wallets &amp; Balances</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Buyer, vendor, and system wallet overview
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Buyer Wallets" value={String(summary.buyerWallets.count)} />
          <StatsCard label="Buyer Balance" value={fmt(summary.buyerWallets.totalBalance)} />
          <StatsCard label="Vendor Wallets" value={String(summary.vendorWallets.count)} />
          <StatsCard label="Vendor Balance" value={fmt(summary.vendorWallets.totalBalance)} />
          <StatsCard label="Vendor Earnings" value={fmt(summary.vendorWallets.totalEarnings)} />
          <StatsCard label="Platform Revenue" value={fmt(summary.systemWallet.revenue)} />
          <StatsCard label="Platform Fees" value={fmt(summary.systemWallet.fees)} />
        </div>
      )}

      {/* Recent transactions */}
      <h2 className="text-lg font-semibold text-[var(--color-text)]">Recent Transactions</h2>

      <DataTable
        loading={loading}
        data={(txResult?.data ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No wallet transactions."
        columns={[
          { key: "id", header: "TX ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["id"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "ownerType", header: "Owner",
            render: (row) => (
              <span className="text-xs uppercase tracking-wide">{String(row["ownerType"])}</span>
            ),
          },
          { key: "type", header: "Type",
            render: (row) => (
              <span className="text-xs font-medium">{String(row["type"])}</span>
            ),
          },
          { key: "amount", header: "Amount",
            render: (row) => (
              <span className="font-semibold">{fmt(String(row["amount"]))}</span>
            ),
          },
          { key: "balance", header: "Balance After",
            render: (row) => (
              <span className="text-sm">{fmt(String(row["balance"]))}</span>
            ),
          },
          { key: "description", header: "Description",
            render: (row) => (
              <span className="text-xs text-[var(--color-text-muted)] max-w-[200px] truncate block">
                {row["description"] ? String(row["description"]) : "—"}
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
