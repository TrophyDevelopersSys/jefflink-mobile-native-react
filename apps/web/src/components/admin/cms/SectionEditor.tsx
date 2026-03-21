"use client";

import React, { useState } from "react";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import type {
  CmsLayout,
  CmsSliderItem,
  CmsBannerItem,
  CmsContentBlock,
  CmsListBlock,
} from "@jefflink/types";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

/* ─── Sub-editor: Slider Items ─────────────────────────────────────────────── */

function SliderEditor({
  items,
  onChange,
}: {
  items: CmsSliderItem[];
  onChange: (v: CmsSliderItem[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsSliderItem>) {
    onChange(items.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  }

  function add() {
    onChange([
      ...items,
      { id: uid(), title: "", imageUrl: "", sortOrder: items.length },
    ]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[var(--color-text)]">
        Slider Items
      </legend>
      {items.map((s, i) => (
        <div
          key={s.id}
          className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 bg-[var(--color-card)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => i > 0 && onChange(swap(items, i, i - 1))}
                disabled={i === 0}
                className="p-1 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  i < items.length - 1 && onChange(swap(items, i, i + 1))
                }
                disabled={i === items.length - 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <input
            placeholder="Title"
            value={s.title}
            onChange={(e) => update(i, { title: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <input
            placeholder="Subtitle (optional)"
            value={s.subtitle ?? ""}
            onChange={(e) => update(i, { subtitle: e.target.value || undefined })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <input
            placeholder="Image URL"
            value={s.imageUrl}
            onChange={(e) => update(i, { imageUrl: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Button Label"
              value={s.buttonLabel ?? ""}
              onChange={(e) =>
                update(i, { buttonLabel: e.target.value || undefined })
              }
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
            <input
              placeholder="Button Link"
              value={s.buttonLink ?? ""}
              onChange={(e) =>
                update(i, { buttonLink: e.target.value || undefined })
              }
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <Plus size={14} /> Add slider
      </button>
    </fieldset>
  );
}

/* ─── Sub-editor: Banner Items ─────────────────────────────────────────────── */

function BannerEditor({
  items,
  onChange,
}: {
  items: CmsBannerItem[];
  onChange: (v: CmsBannerItem[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsBannerItem>) {
    onChange(items.map((b, i) => (i === idx ? { ...b, ...patch } : b)));
  }

  function add() {
    onChange([...items, { id: uid(), imageUrl: "" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[var(--color-text)]">
        Header Banners
      </legend>
      {items.map((b, i) => (
        <div
          key={b.id}
          className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 bg-[var(--color-card)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => i > 0 && onChange(swap(items, i, i - 1))}
                disabled={i === 0}
                className="p-1 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  i < items.length - 1 && onChange(swap(items, i, i + 1))
                }
                disabled={i === items.length - 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <input
            placeholder="Image URL"
            value={b.imageUrl}
            onChange={(e) => update(i, { imageUrl: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Link (optional)"
              value={b.link ?? ""}
              onChange={(e) => update(i, { link: e.target.value || undefined })}
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
            <input
              placeholder="Alt text"
              value={b.alt ?? ""}
              onChange={(e) => update(i, { alt: e.target.value || undefined })}
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <Plus size={14} /> Add banner
      </button>
    </fieldset>
  );
}

/* ─── Sub-editor: Content Blocks ───────────────────────────────────────────── */

function BodyEditor({
  items,
  onChange,
}: {
  items: CmsContentBlock[];
  onChange: (v: CmsContentBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsContentBlock>) {
    onChange(items.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function add() {
    onChange([...items, { id: uid(), key: "", value: "", type: "text" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[var(--color-text)]">
        Body Content Blocks
      </legend>
      {items.map((c, i) => (
        <div
          key={c.id}
          className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 bg-[var(--color-card)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => i > 0 && onChange(swap(items, i, i - 1))}
                disabled={i === 0}
                className="p-1 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  i < items.length - 1 && onChange(swap(items, i, i + 1))
                }
                disabled={i === items.length - 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Key"
              value={c.key}
              onChange={(e) => update(i, { key: e.target.value })}
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
            <select
              value={c.type}
              onChange={(e) =>
                update(i, {
                  type: e.target.value as CmsContentBlock["type"],
                })
              }
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            >
              <option value="text">Text</option>
              <option value="html">HTML</option>
              <option value="json">JSON</option>
              <option value="url">URL</option>
            </select>
          </div>
          <textarea
            placeholder="Value"
            value={c.value}
            onChange={(e) => update(i, { value: e.target.value })}
            rows={c.type === "html" || c.type === "json" ? 4 : 2}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] font-mono"
          />
          <input
            placeholder="Description (optional)"
            value={c.description ?? ""}
            onChange={(e) =>
              update(i, { description: e.target.value || undefined })
            }
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <Plus size={14} /> Add content block
      </button>
    </fieldset>
  );
}

/* ─── Sub-editor: List Blocks ──────────────────────────────────────────────── */

function ListEditor({
  items,
  onChange,
}: {
  items: CmsListBlock[];
  onChange: (v: CmsListBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsListBlock>) {
    onChange(items.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  }

  function add() {
    onChange([...items, { id: uid(), title: "", limit: 10 }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-[var(--color-text)]">
        List Blocks
      </legend>
      {items.map((l, i) => (
        <div
          key={l.id}
          className="border border-[var(--color-border)] rounded-lg p-3 space-y-2 bg-[var(--color-card)]"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-text-muted)]">
              #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => i > 0 && onChange(swap(items, i, i - 1))}
                disabled={i === 0}
                className="p-1 disabled:opacity-30"
              >
                <ChevronUp size={14} />
              </button>
              <button
                type="button"
                onClick={() =>
                  i < items.length - 1 && onChange(swap(items, i, i + 1))
                }
                disabled={i === items.length - 1}
                className="p-1 disabled:opacity-30"
              >
                <ChevronDown size={14} />
              </button>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="p-1 text-red-500 hover:text-red-700"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
          <input
            placeholder="Section Title"
            value={l.title}
            onChange={(e) => update(i, { title: e.target.value })}
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Listing type (e.g. vehicle)"
              value={l.listingType ?? ""}
              onChange={(e) =>
                update(i, { listingType: e.target.value || undefined })
              }
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
            <input
              type="number"
              placeholder="Limit"
              value={l.limit ?? ""}
              onChange={(e) =>
                update(i, { limit: e.target.value ? Number(e.target.value) : undefined })
              }
              className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
      >
        <Plus size={14} /> Add list block
      </button>
    </fieldset>
  );
}

/* ─── Main SectionEditor ───────────────────────────────────────────────────── */

interface SectionEditorProps {
  layout: CmsLayout;
  onChange: (layout: CmsLayout) => void;
}

export default function SectionEditor({ layout, onChange }: SectionEditorProps) {
  const [active, setActive] = useState<string>("slider");

  const tabs = [
    { key: "slider",  label: "Slider",  count: layout.slider?.length ?? 0 },
    { key: "header",  label: "Banners", count: layout.header?.length ?? 0 },
    { key: "body",    label: "Content", count: layout.body?.length ?? 0 },
    { key: "lists",   label: "Lists",   count: layout.lists?.length ?? 0 },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-text)] uppercase tracking-wide">
        Page Layout Sections
      </h3>

      {/* Section tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)]">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActive(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              active === t.key
                ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            }`}
          >
            {t.label}
            <span className="ml-1 text-xs opacity-60">({t.count})</span>
          </button>
        ))}
      </div>

      {/* Active section editor */}
      {active === "slider" && (
        <SliderEditor
          items={layout.slider ?? []}
          onChange={(slider) => onChange({ ...layout, slider })}
        />
      )}
      {active === "header" && (
        <BannerEditor
          items={layout.header ?? []}
          onChange={(header) => onChange({ ...layout, header })}
        />
      )}
      {active === "body" && (
        <BodyEditor
          items={layout.body ?? []}
          onChange={(body) => onChange({ ...layout, body })}
        />
      )}
      {active === "lists" && (
        <ListEditor
          items={layout.lists ?? []}
          onChange={(lists) => onChange({ ...layout, lists })}
        />
      )}
    </div>
  );
}
