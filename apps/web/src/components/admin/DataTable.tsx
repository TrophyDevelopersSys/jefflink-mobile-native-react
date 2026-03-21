"use client";

import React from "react";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  loading,
  emptyMessage = "No data found.",
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] overflow-hidden">
        <div className="p-8 text-center text-[var(--color-text-muted)]">Loading…</div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--color-border)] overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-surface)] border-b border-[var(--color-border)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className={`text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide px-4 py-3 ${col.className ?? ""}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="text-center py-10 text-[var(--color-text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={`border-b border-[var(--color-border)] last:border-0 ${
                  onRowClick ? "cursor-pointer hover:bg-[var(--color-border)]/40" : ""
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className={`px-4 py-3 text-[var(--color-text)] ${col.className ?? ""}`}
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "—")}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// ── Re-usable status badge ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700",
  VERIFIED:  "bg-green-100 text-green-700",
  AVAILABLE: "bg-green-100 text-green-700",
  APPROVED:  "bg-green-100 text-green-700",
  SUCCESS:   "bg-green-100 text-green-700",
  PUBLISHED: "bg-green-100 text-green-700",
  SUSPENDED: "bg-yellow-100 text-yellow-700",
  PENDING:   "bg-yellow-100 text-yellow-700",
  DRAFT:     "bg-yellow-100 text-yellow-700",
  PENDING_REVIEW: "bg-blue-100 text-blue-700",
  OPEN:      "bg-blue-100 text-blue-700",
  REJECTED:  "bg-red-100 text-red-700",
  BANNED:    "bg-red-100 text-red-700",
  ARCHIVED:  "bg-gray-100 text-gray-600",
  DISMISSED: "bg-gray-100 text-gray-600",
  RESOLVED:  "bg-purple-100 text-purple-700",
};

export function StatusBadge({ status }: { status: string }) {
  const classes = STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}
