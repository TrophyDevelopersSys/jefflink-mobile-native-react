"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminUsers, updateUserStatus } from "../../../src/lib/admin-api";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdAt: string;
}

interface UsersPage {
  data: AdminUser[];
  total: number;
  page: number;
  limit: number;
}

const PAGE_LIMIT = 20;

export default function AdminUsersPage() {
  const [page, setPage]       = useState(1);
  const [search, setSearch]   = useState("");
  const [result, setResult]   = useState<UsersPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [acting, setActing]   = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminUsers(page, PAGE_LIMIT, search || undefined);
      setResult(data as UsersPage);
    } catch {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  async function handleStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "BANNED") {
    setActing(userId);
    try {
      await updateUserStatus(userId, status);
      await load();
    } catch {
      setError("Action failed. Please try again.");
    } finally {
      setActing(null);
    }
  }

  const totalPages = result ? Math.ceil(result.total / PAGE_LIMIT) : 1;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Users</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage platform users
          </p>
        </div>
        <span className="text-sm text-[var(--color-text-muted)]">
          {result?.total ?? 0} total
        </span>
      </div>

      <input
        type="search"
        placeholder="Search by name, email or phone…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="w-full sm:w-80 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={(result?.data ?? []) as unknown as Record<string, unknown>[]}
        emptyMessage="No users found."
        columns={[
          { key: "name",  header: "Name" },
          { key: "email", header: "Email",
            render: (row) => (
              <span className="text-xs text-[var(--color-text-muted)]">{String(row["email"])}</span>
            ),
          },
          { key: "phone", header: "Phone",
            render: (row) => <span>{row["phone"] ? String(row["phone"]) : "—"}</span>,
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row["status"])} />,
          },
          { key: "createdAt", header: "Joined",
            render: (row) => new Date(String(row["createdAt"])).toLocaleDateString("en-UG"),
          },
          { key: "actions", header: "",
            render: (row) => {
              const id = String(row["id"]);
              const status = String(row["status"]);
              const busy = acting === id;
              return (
                <div className="flex gap-2">
                  {status !== "ACTIVE" && (
                    <button
                      onClick={() => handleStatus(id, "ACTIVE")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Activate"}
                    </button>
                  )}
                  {status !== "SUSPENDED" && (
                    <button
                      onClick={() => handleStatus(id, "SUSPENDED")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Suspend"}
                    </button>
                  )}
                  {status !== "BANNED" && (
                    <button
                      onClick={() => handleStatus(id, "BANNED")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Ban"}
                    </button>
                  )}
                </div>
              );
            },
          },
        ]}
      />

      {/* Pagination */}
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
