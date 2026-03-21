"use client";

import React, { useEffect, useState, useCallback } from "react";
import { DataTable } from "../../../src/components/admin/DataTable";
import { getAuditLogs } from "../../../src/lib/admin-api";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  ip?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

const LIMIT_OPTIONS = [25, 50, 100, 200] as const;

export default function AdminAuditLogsPage() {
  const [limit, setLimit]     = useState<number>(50);
  const [logs, setLogs]       = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAuditLogs(limit);
      setLogs(Array.isArray(data) ? data : (data as { data: AuditLog[] }).data ?? []);
    } catch {
      setError("Failed to load audit logs.");
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Audit Logs</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Immutable record of all admin actions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-text-muted)]">Show:</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            title="Number of logs to display"
            className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
          >
            {LIMIT_OPTIONS.map((n) => (
              <option key={n} value={n}>{n} entries</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={logs as unknown as Record<string, unknown>[]}
        emptyMessage="No audit logs found."
        columns={[
          { key: "createdAt", header: "Timestamp",
            render: (row) => (
              <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">
                {new Date(String(row["createdAt"])).toLocaleString("en-UG")}
              </span>
            ),
          },
          { key: "userId", header: "User",
            render: (row) => (
              <span className="font-mono text-xs">{String(row["userId"]).slice(0, 12)}…</span>
            ),
          },
          { key: "action", header: "Action",
            render: (row) => (
              <span className="text-xs font-semibold uppercase tracking-wide">
                {String(row["action"])}
              </span>
            ),
          },
          { key: "entityType", header: "Entity",
            render: (row) => {
              const type = row["entityType"] ? String(row["entityType"]) : "";
              const id = row["entityId"] ? String(row["entityId"]).slice(0, 8) : "";
              if (!type) return <span className="text-[var(--color-text-muted)]">—</span>;
              return (
                <span className="text-xs">
                  {type}{id && ` · ${id}…`}
                </span>
              );
            },
          },
          { key: "ip", header: "IP",
            render: (row) => (
              <span className="font-mono text-xs text-[var(--color-text-muted)]">
                {row["ip"] ? String(row["ip"]) : "—"}
              </span>
            ),
          },
        ]}
      />
    </div>
  );
}
