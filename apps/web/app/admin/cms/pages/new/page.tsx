"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CmsBreadcrumb } from "../../../../../src/components/admin/cms/CmsSubNav";
import SectionEditor from "../../../../../src/components/admin/cms/SectionEditor";
import { createCmsPage } from "../../../../../src/lib/cms-api";
import type { CmsPlatform, CmsLayout, CmsSeo } from "@jefflink/types";

export default function NewCmsPagePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [platform, setPlatform] = useState<CmsPlatform>("ALL");
  const [locale, setLocale] = useState("en");
  const [layout, setLayout] = useState<CmsLayout>({
    header: [],
    slider: [],
    body: [],
    lists: [],
  });
  const [seo, setSeo] = useState<CmsSeo>({});

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !slug.trim()) {
      setError("Title and slug are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createCmsPage({ title, slug, platform, locale, layout, seo });
      router.push("/admin/cms");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to create page.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <CmsBreadcrumb items={[{ label: "Pages", href: "/admin/cms" }, { label: "New Page" }]} />
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Create New Page
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Build a CMS page with sliders, banners, content blocks, and lists
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Meta fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Homepage"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Slug
            </label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="homepage"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
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
              placeholder="en"
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

        {/* Layout sections */}
        <div className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-card)]">
          <SectionEditor layout={layout} onChange={setLayout} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create Page (Draft)"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/admin/cms")}
            className="px-6 py-2.5 text-sm text-[var(--color-text-muted)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface)]"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
