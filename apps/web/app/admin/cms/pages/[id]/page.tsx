"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CmsBreadcrumb } from "../../../../../src/components/admin/cms/CmsSubNav";
import SectionEditor from "../../../../../src/components/admin/cms/SectionEditor";
import { StatusBadge } from "../../../../../src/components/admin/DataTable";
import {
  updateCmsPage,
  publishCmsPage,
  getCmsPageRevisions,
  listCmsPages,
} from "../../../../../src/lib/cms-api";
import type { CmsPage, CmsLayout, CmsSeo, CmsPlatform, CmsPageRevision } from "@jefflink/types";

export default function EditCmsPagePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [page, setPage] = useState<CmsPage | null>(null);
  const [revisions, setRevisions] = useState<CmsPageRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showRevisions, setShowRevisions] = useState(false);

  // Form state (populated from loaded page)
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<CmsPlatform>("ALL");
  const [locale, setLocale] = useState("en");
  const [layout, setLayout] = useState<CmsLayout>({});
  const [seo, setSeo] = useState<CmsSeo>({});

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // The admin list endpoint returns all pages; find by ID
      const pages = await listCmsPages();
      const found = pages.find((p) => p._id === id);
      if (!found) {
        setError("Page not found.");
        setLoading(false);
        return;
      }
      setPage(found);
      setTitle(found.title);
      setPlatform(found.platform);
      setLocale(found.locale);
      setLayout(found.layout ?? {});
      setSeo(found.seo ?? {});
    } catch {
      setError("Failed to load page.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadRevisions = useCallback(async () => {
    try {
      const revs = await getCmsPageRevisions(id);
      setRevisions(revs);
    } catch {
      /* non-critical */
    }
  }, [id]);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!page) return;
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await updateCmsPage(id, {
        title,
        platform,
        locale,
        layout,
        seo,
        expectedVersion: page.version,
      });
      setPage(updated);
      setSuccess("Page saved. Version " + updated.version);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Save failed.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish(status: "PUBLISHED" | "ARCHIVED") {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await publishCmsPage(id, status);
      setPage(updated);
      setSuccess(status === "PUBLISHED" ? "Page published!" : "Page archived.");
    } catch {
      setError("Publish action failed.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="space-y-4">
        <CmsBreadcrumb items={[{ label: "Pages", href: "/admin/cms" }, { label: "Not Found" }]} />
        <p className="text-[var(--color-text-muted)]">
          {error ?? "Page not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CmsBreadcrumb items={[{ label: "Pages", href: "/admin/cms" }, { label: page.title || "Edit" }]} />
      {/* Header */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            Edit Page
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {page.slug} &middot; v{page.version}
          </p>
        </div>
        <StatusBadge status={page.status} />
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Meta fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Slug{" "}
              <span className="text-[var(--color-text-muted)] font-normal">
                (read-only)
              </span>
            </label>
            <input
              value={page.slug}
              readOnly
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text-muted)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as CmsPlatform)}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            >
              <option value="ALL">ALL</option>
              <option value="MOBILE">MOBILE</option>
              <option value="WEB">WEB</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Locale
            </label>
            <input
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>

        {/* SEO */}
        <fieldset className="border border-[var(--color-border)] rounded-lg p-4 space-y-3">
          <legend className="text-sm font-semibold text-[var(--color-text)] px-1">
            SEO Settings
          </legend>
          <input
            value={seo.title ?? ""}
            onChange={(e) => setSeo({ ...seo, title: e.target.value || undefined })}
            placeholder="SEO title"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <textarea
            value={seo.description ?? ""}
            onChange={(e) =>
              setSeo({ ...seo, description: e.target.value || undefined })
            }
            placeholder="SEO description"
            rows={2}
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <input
            value={seo.imageUrl ?? ""}
            onChange={(e) =>
              setSeo({ ...seo, imageUrl: e.target.value || undefined })
            }
            placeholder="OG image URL"
            className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        </fieldset>

        {/* Layout editor */}
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
          <SectionEditor layout={layout} onChange={setLayout} />
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
          {page.status === "DRAFT" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handlePublish("PUBLISHED")}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Publish
            </button>
          )}
          {page.status === "PUBLISHED" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handlePublish("ARCHIVED")}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 disabled:opacity-50"
            >
              Archive
            </button>
          )}
          {page.status === "ARCHIVED" && (
            <button
              type="button"
              disabled={saving}
              onClick={() => handlePublish("PUBLISHED")}
              className="px-6 py-2.5 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Re-publish
            </button>
          )}
        </div>
      </form>

      {/* Revision history */}
      <div className="border border-[var(--color-border)] rounded-lg">
        <button
          type="button"
          onClick={() => {
            setShowRevisions(!showRevisions);
            if (!showRevisions && revisions.length === 0) void loadRevisions();
          }}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)] rounded-lg"
        >
          <span>Revision History</span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {showRevisions ? "▲ Hide" : "▼ Show"}
          </span>
        </button>
        {showRevisions && (
          <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
            {revisions.length === 0 && (
              <p className="text-sm text-[var(--color-text-muted)]">
                No revisions yet.
              </p>
            )}
            {revisions.map((rev) => (
              <div
                key={rev._id ?? rev.version}
                className="flex justify-between items-center text-sm py-1 border-b border-[var(--color-border)] last:border-0"
              >
                <span className="text-[var(--color-text)]">
                  v{rev.version} &middot; {rev.slug}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {new Date(rev.createdAt).toLocaleString("en-UG")}
                  {rev.createdBy && ` · ${rev.createdBy}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
