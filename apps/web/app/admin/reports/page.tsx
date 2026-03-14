"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminReports, resolveReport } from "../../../src/lib/admin-api";

type ReportStatus = "OPEN" | "RESOLVED" | "DISMISSED";

interface Report {
  id: string;
  listingType: string;
  listingId: string;
  reportedBy: string;
  reason: string;
  status: string;
  resolutionNote?: string;
  createdAt: string;
}

interface ReportsPage {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 20;

const STATUS_TABS: Array<{ label: string; value: ReportStatus | "" }> = [
  { label: "All",       value: "" },
  { label: "Open",      value: "OPEN" },
  { label: "Resolved",  value: "RESOLVED" },
  { label: "Dismissed", value: "DISMISSED" },
];

export default function AdminReportsPage() {
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState<ReportStatus | "">("");
  const [result, setResult]   = useState<ReportsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [acting, setActing]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminReports(page, PAGE_LIMIT, status || undefined);
      setResult(data as ReportsPage);
    } catch {
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function handleResolve(reportId: string, resolution: "RESOLVED" | "DISMISSED") {
    const note = window.prompt(`Note for ${resolution.toLowerCase()}:`);
    if (!note) return;
    setActing(reportId);
    try {
      await resolveReport(reportId, resolution, note);
      await load();
    } catch {
      setError("Action failed.");
    } finally {
      setActing(null);
    }
  }

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Reports</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Listing reports and moderation queue
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {result?.total ?? 0} total
        </span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {STATUS_TABS.map(({ label, value }) => (
          <button
            key={value || "all"}
            onClick={() => { setStatus(value); setPage(1); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              status === value
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={(result?.data ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No reports found."
        columns={[
          { key: "listingType", header: "Listing Type",
            render: (row) => (
              <span className="text-xs uppercase tracking-wide">{String(row["listingType"])}</span>
            ),
          },
          { key: "listingId", header: "Listing ID",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {String(row["listingId"]).slice(0, 8)}…
              </span>
            ),
          },
          { key: "reason", header: "Reason",
            render: (row) => (
              <span className="text-xs capitalize">
                {String(row["reason"]).toLowerCase().replace(/_/g, " ")}
              </span>
            ),
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
          },
          { key: "createdAt", header: "Reported",
            render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
          },
          { key: "actions", header: "",
            render: (row) => {
              const id = String(row["id"]);
              const st = String(row["status"]);
              const busy = acting === id;
              if (st !== "OPEN") return null;
              return (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleResolve(id, "RESOLVED")}
                    disabled={busy}
                    className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                  >
                    {busy ? "…" : "Resolve"}
                  </button>
                  <button
                    onClick={() => handleResolve(id, "DISMISSED")}
                    disabled={busy}
                    className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                  >
                    {busy ? "…" : "Dismiss"}
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
