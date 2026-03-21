"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import { getAdminNotifications } from "../../../src/lib/admin-api";

type Tab = "requests" | "notifications";

interface RequestItem {
  id: string;
  type: string;
  userId: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

interface NotificationItem {
  id: string;
  channel: string;
  recipient: string;
  title: string;
  status: string;
  sentAt: string;
}

interface NotiResult {
  requests: { data: RequestItem[]; total: number };
  notifications: { data: NotificationItem[]; total: number };
}

const PAGE_LIMIT = 25;

export default function AdminNotificationsPage() {
  const [tab, setTab]         = useState<Tab>("requests");
  const [result, setResult]   = useState<NotiResult | null>(null);
  const [page, setPage]       = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAdminNotifications(tab, page, PAGE_LIMIT);
      setResult(data as NotiResult);
    } catch {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [tab]);

  const activeSet = tab === "requests" ? result?.requests : result?.notifications;
  const totalPages = activeSet ? Math.ceil(activeSet.total / PAGE_LIMIT) : 1;

  const TABS: { key: Tab; label: string }[] = [
    { key: "requests",      label: "Customer & Vendor Requests" },
    { key: "notifications", label: "Notification Log" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Notifications &amp; Requests</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Support tickets, HP applications, and notification delivery
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

      {/* Requests tab */}
      {tab === "requests" && (
        <DataTable
          loading={loading}
          data={(result?.requests?.data ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No requests."
          columns={[
            { key: "id", header: "ID",
              render: (row) => (
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {String(row["id"]).slice(0, 8)}…
                </span>
              ),
            },
            { key: "type", header: "Type",
              render: (row) => (
                <span className="text-xs font-medium uppercase tracking-wide">{String(row["type"])}</span>
              ),
            },
            { key: "userId", header: "User",
              render: (row) => (
                <span className="font-mono text-xs">{String(row["userId"]).slice(0, 8)}…</span>
              ),
            },
            { key: "subject", header: "Subject" },
            { key: "priority", header: "Priority",
              render: (row) => {
                const p = String(row["priority"]);
                const color = p === "HIGH" || p === "URGENT"
                  ? "text-red-600 bg-red-50"
                  : p === "MEDIUM"
                  ? "text-yellow-700 bg-yellow-50"
                  : "text-gray-600 bg-gray-100";
                return (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${color}`}>{p}</span>
                );
              },
            },
            { key: "status", header: "Status",
              render: (row) => <StatusBadge status={String(row["status"])} />,
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

      {/* Notification log tab */}
      {tab === "notifications" && (
        <DataTable
          loading={loading}
          data={(result?.notifications?.data ?? []) as unknown as Record<string, unknown>[]}
          emptyMessage="No notifications."
          columns={[
            { key: "id", header: "ID",
              render: (row) => (
                <span className="font-mono text-xs text-[var(--color-text-muted)]">
                  {String(row["id"]).slice(0, 8)}…
                </span>
              ),
            },
            { key: "channel", header: "Channel",
              render: (row) => (
                <span className="text-xs font-medium uppercase">{String(row["channel"])}</span>
              ),
            },
            { key: "recipient", header: "Recipient" },
            { key: "title", header: "Title" },
            { key: "status", header: "Status",
              render: (row) => <StatusBadge status={String(row["status"])} />,
            },
            { key: "sentAt", header: "Sent",
              render: (row) => (
                <span className="text-xs whitespace-nowrap">
                  {new Date(String(row["sentAt"])).toLocaleString("en-UG")}
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
