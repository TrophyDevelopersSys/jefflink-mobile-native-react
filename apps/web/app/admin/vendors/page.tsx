"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminVendors, verifyVendor, suspendVendor } from "../../../src/lib/admin-api";

interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  location?: string;
  verificationStatus: string;
  createdAt: string;
}

interface VendorsPage {
  data: Vendor[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 20;

export default function AdminVendorsPage() {
  const [page, setPage]       = useState(1);
  const [status, setStatus]   = useState<string>("");
  const [result, setResult]   = useState<VendorsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [acting, setActing]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminVendors(page, PAGE_LIMIT);
      setResult(data as VendorsPage);
    } catch {
      setError("Failed to load vendors.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  async function handleVerify(vendorId: string) {
    setActing(vendorId);
    try {
      await verifyVendor(vendorId);
      await load();
    } catch {
      setError("Verification failed.");
    } finally {
      setActing(null);
    }
  }

  async function handleSuspend(vendorId: string) {
    const reason = window.prompt("Reason for suspension:");
    if (!reason) return;
    setActing(vendorId);
    try {
      await suspendVendor(vendorId, reason);
      await load();
    } catch {
      setError("Suspension failed.");
    } finally {
      setActing(null);
    }
  }

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  const statusFilters = ["", "PENDING", "VERIFIED", "REJECTED", "SUSPENDED"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Vendors</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Verify and manage vendor profiles
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {result?.total ?? 0} total
        </span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((s) => (
          <button
            key={s || "all"}
            onClick={() => { setStatus(s); setPage(1); }}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              status === s
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            }`}
          >
            {s || "All"}
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
        emptyMessage="No vendors found."
        columns={[
          { key: "businessName", header: "Business Name" },
          { key: "businessType", header: "Type",
            render: (row) => (
              <span className="text-xs uppercase tracking-wide text-[var(--color-text-muted)]">
                {String(row["businessType"])}
              </span>
            ),
          },
          { key: "location", header: "Location",
            render: (row) => <span>{row["location"] ? String(row["location"]) : "—"}</span>,
          },
          { key: "verificationStatus", header: "Status",
            render: (row) => <StatusBadge status={String(row["verificationStatus"])} />,
          },
          { key: "createdAt", header: "Registered",
            render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
          },
          { key: "actions", header: "",
            render: (row) => {
              const id = String(row["id"]);
              const vstatus = String(row["verificationStatus"]);
              const busy = acting === id;
              return (
                <div className="flex gap-2">
                  {vstatus === "PENDING" && (
                    <button
                      onClick={() => handleVerify(id)}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Verify"}
                    </button>
                  )}
                  {vstatus !== "SUSPENDED" && (
                    <button
                      onClick={() => handleSuspend(id)}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Suspend"}
                    </button>
                  )}
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
