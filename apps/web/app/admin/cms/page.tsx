"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { DataTable, StatusBadge } from "../../../src/components/admin/DataTable";
import {
  listCmsPages,
  publishCmsPage,
  deleteCmsPage,
} from "../../../src/lib/cms-api";
import type { CmsPlatform, CmsPageStatus } from "@jefflink/types";

interface PageRow {
  _id: string;
  slug: string;
  title: string;
  platform: CmsPlatform;
  locale: string;
  status: CmsPageStatus;
  version: number;
  updatedAt: string;
}

export default function CmsPagesListPage() {
  const router = useRouter();
  const [pages, setPages]         = useState<PageRow[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [acting, setActing]       = useState<string | null>(null);
  const [platform, setPlatform]   = useState<CmsPlatform | "">("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listCmsPages(platform || undefined);
      setPages(data as unknown as PageRow[]);
    } catch {
      setError("Failed to load CMS pages.");
    } finally {
      setLoading(false);
    }
  }, [platform]);

  useEffect(() => { load(); }, [load]);

  async function handlePublish(id: string, status: "PUBLISHED" | "ARCHIVED") {
    setActing(id);
    try {
      await publishCmsPage(id, status);
      await load();
    } catch {
      setError("Action failed.");
    } finally {
      setActing(null);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this page permanently?")) return;
    setActing(id);
    try {
      await deleteCmsPage(id);
      await load();
    } catch {
      setError("Delete failed.");
    } finally {
      setActing(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">CMS Pages</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage homepage sliders, banners, and content pages
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/cms/pages/new")}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90"
        >
          + New Page
        </button>
      </div>

      {/* Platform filter */}
      <div className="flex gap-2 items-center">
        <label htmlFor="cms-platform-filter" className="text-sm text-[var(--color-text-muted)]">Platform:</label>
        <select
          id="cms-platform-filter"
          value={platform}
          onChange={(e) => setPlatform(e.target.value as CmsPlatform | "")}
          className="px-3 py-1.5 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-card)] text-[var(--color-text)]"
        >
          <option value="">All</option>
          <option value="ALL">ALL</option>
          <option value="MOBILE">MOBILE</option>
          <option value="WEB">WEB</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <DataTable
        loading={loading}
        data={pages as unknown as Record<string, unknown>[]}
        emptyMessage="No CMS pages yet."
        onRowClick={(row) => router.push(`/admin/cms/pages/${row._id}`)}
        columns={[
          { key: "title", header: "Title" },
          { key: "slug", header: "Slug",
            render: (row) => (
              <code className="text-xs bg-[var(--color-surface)] px-1.5 py-0.5 rounded">
                {String(row.slug)}
              </code>
            ),
          },
          { key: "platform", header: "Platform",
            render: (row) => (
              <span className="text-xs font-medium">{String(row.platform)}</span>
            ),
          },
          { key: "status", header: "Status",
            render: (row) => <StatusBadge status={String(row.status)} />,
          },
          { key: "version", header: "Ver",
            render: (row) => (
              <span className="text-xs text-[var(--color-text-muted)]">v{String(row.version)}</span>
            ),
          },
          { key: "updatedAt", header: "Updated",
            render: (row) => new Date(String(row.updatedAt)).toLocaleDateString("en-UG"),
          },
          { key: "actions", header: "",
            render: (row) => {
              const id = String(row._id);
              const status = String(row.status);
              const busy = acting === id;
              return (
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  {status === "DRAFT" && (
                    <button
                      onClick={() => handlePublish(id, "PUBLISHED")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Publish"}
                    </button>
                  )}
                  {status === "PUBLISHED" && (
                    <button
                      onClick={() => handlePublish(id, "ARCHIVED")}
                      disabled={busy}
                      className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-700 hover:bg-yellow-200 disabled:opacity-50"
                    >
                      {busy ? "…" : "Archive"}
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(id)}
                    disabled={busy}
                    className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                  >
                    {busy ? "…" : "Delete"}
                  </button>
                </div>
              );
            },
          },
        ]}
      />


    </div>
  );
}
