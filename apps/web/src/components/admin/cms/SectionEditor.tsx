"use client";

import React, { useState } from "react";
import {
  ChevronUp,
  ChevronDown,
  Plus,
  Trash2,
  Sliders,
  Image as ImageIcon,
  LayoutGrid,
  ListOrdered,
  Zap,
  Type,
  MousePointer,
  BarChart3,
  MessageSquareQuote,
  HelpCircle,
  FileText,
} from "lucide-react";
import type {
  CmsLayout,
  CmsSliderItem,
  CmsBannerItem,
  CmsContentBlock,
  CmsListBlock,
  CmsHeroBlock,
  CmsTextBlock,
  CmsImageBlock,
  CmsCtaBlock,
  CmsStatsBlock,
  CmsTestimonialsBlock,
  CmsFaqBlock,
} from "@jefflink/types";
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(() => import("./RichTextEditor"), { ssr: false });

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
            rows={c.type === "json" ? 4 : 2}
            className={`w-full px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)] font-mono ${c.type === "html" ? "hidden" : ""}`}
          />
          {c.type === "html" && (
            <RichTextEditor
              value={c.value}
              onChange={(html) => update(i, { value: html })}
              placeholder="Write HTML content…"
            />
          )}
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

/* ─── Sub-editor: Hero Blocks ──────────────────────────────────────────────── */

function HeroEditor({
  items,
  onChange,
}: {
  items: CmsHeroBlock[];
  onChange: (v: CmsHeroBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsHeroBlock>) {
    onChange(items.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  }

  function add() {
    onChange([...items, { id: uid(), heading: "" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Hero Sections</legend>
      {items.map((h, i) => (
        <div key={h.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">#{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-brand-danger hover:text-brand-danger/80">
              <Trash2 size={14} />
            </button>
          </div>
          <input placeholder="Heading" value={h.heading} onChange={(e) => update(i, { heading: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <input placeholder="Subheading (optional)" value={h.subheading ?? ""} onChange={(e) => update(i, { subheading: e.target.value || undefined })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <input placeholder="Background Image URL" value={h.backgroundImageUrl ?? ""} onChange={(e) => update(i, { backgroundImageUrl: e.target.value || undefined })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="CTA Label" value={h.ctaLabel ?? ""} onChange={(e) => update(i, { ctaLabel: e.target.value || undefined })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
            <input placeholder="CTA Link" value={h.ctaLink ?? ""} onChange={(e) => update(i, { ctaLink: e.target.value || undefined })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          </div>
          <select value={h.alignment ?? "center"} onChange={(e) => update(i, { alignment: e.target.value as CmsHeroBlock["alignment"] })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add hero</button>
    </fieldset>
  );
}

/* ─── Sub-editor: Text Blocks ──────────────────────────────────────────────── */

function TextBlockEditor({
  items,
  onChange,
}: {
  items: CmsTextBlock[];
  onChange: (v: CmsTextBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsTextBlock>) {
    onChange(items.map((t, i) => (i === idx ? { ...t, ...patch } : t)));
  }

  function add() {
    onChange([...items, { id: uid(), content: "", format: "html" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Text Blocks</legend>
      {items.map((t, i) => (
        <div key={t.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">#{i + 1}</span>
            <div className="flex gap-1">
              <select value={t.format} onChange={(e) => update(i, { format: e.target.value as CmsTextBlock["format"] })} className="px-2 py-1 text-xs border border-border rounded bg-surface text-text">
                <option value="plain">Plain</option>
                <option value="html">HTML</option>
                <option value="markdown">Markdown</option>
              </select>
              <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
            </div>
          </div>
          {t.format === "html" ? (
            <RichTextEditor value={t.content} onChange={(html) => update(i, { content: html })} placeholder="Write content…" />
          ) : (
            <textarea placeholder="Content" value={t.content} onChange={(e) => update(i, { content: e.target.value })} rows={4} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text font-mono" />
          )}
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add text block</button>
    </fieldset>
  );
}

/* ─── Sub-editor: Image Blocks ─────────────────────────────────────────────── */

function ImageBlockEditor({
  items,
  onChange,
}: {
  items: CmsImageBlock[];
  onChange: (v: CmsImageBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsImageBlock>) {
    onChange(items.map((im, i) => (i === idx ? { ...im, ...patch } : im)));
  }

  function add() {
    onChange([...items, { id: uid(), imageUrl: "" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Image Blocks</legend>
      {items.map((im, i) => (
        <div key={im.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">#{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
          </div>
          <input placeholder="Image URL" value={im.imageUrl} onChange={(e) => update(i, { imageUrl: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <input placeholder="Alt text" value={im.alt ?? ""} onChange={(e) => update(i, { alt: e.target.value || undefined })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <input placeholder="Caption (optional)" value={im.caption ?? ""} onChange={(e) => update(i, { caption: e.target.value || undefined })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add image</button>
    </fieldset>
  );
}

/* ─── Sub-editor: CTA Blocks ──────────────────────────────────────────────── */

function CtaEditor({
  items,
  onChange,
}: {
  items: CmsCtaBlock[];
  onChange: (v: CmsCtaBlock[]) => void;
}) {
  function update(idx: number, patch: Partial<CmsCtaBlock>) {
    onChange(items.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
  }

  function add() {
    onChange([...items, { id: uid(), heading: "", buttonLabel: "", buttonLink: "" }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Call-to-Action Blocks</legend>
      {items.map((c, i) => (
        <div key={c.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">#{i + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
          </div>
          <input placeholder="Heading" value={c.heading} onChange={(e) => update(i, { heading: e.target.value })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <input placeholder="Description (optional)" value={c.description ?? ""} onChange={(e) => update(i, { description: e.target.value || undefined })} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          <div className="grid grid-cols-2 gap-2">
            <input placeholder="Button Label" value={c.buttonLabel} onChange={(e) => update(i, { buttonLabel: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
            <input placeholder="Button Link" value={c.buttonLink} onChange={(e) => update(i, { buttonLink: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
          </div>
          <select value={c.variant ?? "primary"} onChange={(e) => update(i, { variant: e.target.value as CmsCtaBlock["variant"] })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text">
            <option value="primary">Primary</option>
            <option value="secondary">Secondary</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add CTA</button>
    </fieldset>
  );
}

/* ─── Sub-editor: Stats Blocks ────────────────────────────────────────────── */

function StatsEditor({
  items,
  onChange,
}: {
  items: CmsStatsBlock[];
  onChange: (v: CmsStatsBlock[]) => void;
}) {
  function updateItem(blockIdx: number, itemIdx: number, patch: Partial<CmsStatsBlock["items"][0]>) {
    onChange(items.map((s, i) => i === blockIdx ? { ...s, items: s.items.map((it, j) => j === itemIdx ? { ...it, ...patch } : it) } : s));
  }

  function addStat(blockIdx: number) {
    onChange(items.map((s, i) => i === blockIdx ? { ...s, items: [...s.items, { label: "", value: "" }] } : s));
  }

  function add() {
    onChange([...items, { id: uid(), items: [{ label: "", value: "" }] }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Stats Blocks</legend>
      {items.map((s, bi) => (
        <div key={s.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Block #{bi + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== bi))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
          </div>
          {s.items.map((it, ii) => (
            <div key={ii} className="grid grid-cols-3 gap-2">
              <input placeholder="Label" value={it.label} onChange={(e) => updateItem(bi, ii, { label: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
              <input placeholder="Value" value={it.value} onChange={(e) => updateItem(bi, ii, { value: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
              <div className="flex gap-1">
                <input placeholder="Icon (optional)" value={it.icon ?? ""} onChange={(e) => updateItem(bi, ii, { icon: e.target.value || undefined })} className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
                <button type="button" onClick={() => onChange(items.map((sb, si) => si === bi ? { ...sb, items: sb.items.filter((_, j) => j !== ii) } : sb))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addStat(bi)} className="text-xs text-primary hover:underline">+ Add stat</button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add stats block</button>
    </fieldset>
  );
}

/* ─── Sub-editor: Testimonials ─────────────────────────────────────────────── */

function TestimonialsEditor({
  items,
  onChange,
}: {
  items: CmsTestimonialsBlock[];
  onChange: (v: CmsTestimonialsBlock[]) => void;
}) {
  function updateItem(blockIdx: number, itemIdx: number, patch: Partial<CmsTestimonialsBlock["items"][0]>) {
    onChange(items.map((t, i) => i === blockIdx ? { ...t, items: t.items.map((it, j) => j === itemIdx ? { ...it, ...patch } : it) } : t));
  }

  function addTestimonial(blockIdx: number) {
    onChange(items.map((t, i) => i === blockIdx ? { ...t, items: [...t.items, { name: "", quote: "" }] } : t));
  }

  function add() {
    onChange([...items, { id: uid(), items: [{ name: "", quote: "" }] }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">Testimonials</legend>
      {items.map((t, bi) => (
        <div key={t.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Block #{bi + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== bi))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
          </div>
          {t.items.map((it, ii) => (
            <div key={ii} className="border border-border/50 rounded p-2 space-y-1">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Name" value={it.name} onChange={(e) => updateItem(bi, ii, { name: e.target.value })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
                <input placeholder="Role (optional)" value={it.role ?? ""} onChange={(e) => updateItem(bi, ii, { role: e.target.value || undefined })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
              </div>
              <textarea placeholder="Quote" value={it.quote} onChange={(e) => updateItem(bi, ii, { quote: e.target.value })} rows={2} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
              <div className="flex gap-2">
                <input placeholder="Avatar URL" value={it.avatarUrl ?? ""} onChange={(e) => updateItem(bi, ii, { avatarUrl: e.target.value || undefined })} className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
                <select value={it.rating ?? ""} onChange={(e) => updateItem(bi, ii, { rating: e.target.value ? Number(e.target.value) : undefined })} className="px-2 py-1.5 text-sm border border-border rounded bg-surface text-text">
                  <option value="">No rating</option>
                  {[1, 2, 3, 4, 5].map((r) => <option key={r} value={r}>{r} star{r !== 1 ? "s" : ""}</option>)}
                </select>
                <button type="button" onClick={() => onChange(items.map((tb, si) => si === bi ? { ...tb, items: tb.items.filter((_, j) => j !== ii) } : tb))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={() => addTestimonial(bi)} className="text-xs text-primary hover:underline">+ Add testimonial</button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add testimonials block</button>
    </fieldset>
  );
}

/* ─── Sub-editor: FAQ Blocks ──────────────────────────────────────────────── */

function FaqEditor({
  items,
  onChange,
}: {
  items: CmsFaqBlock[];
  onChange: (v: CmsFaqBlock[]) => void;
}) {
  function updateItem(blockIdx: number, itemIdx: number, patch: Partial<CmsFaqBlock["items"][0]>) {
    onChange(items.map((f, i) => i === blockIdx ? { ...f, items: f.items.map((it, j) => j === itemIdx ? { ...it, ...patch } : it) } : f));
  }

  function addFaq(blockIdx: number) {
    onChange(items.map((f, i) => i === blockIdx ? { ...f, items: [...f.items, { question: "", answer: "" }] } : f));
  }

  function add() {
    onChange([...items, { id: uid(), items: [{ question: "", answer: "" }] }]);
  }

  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-text">FAQ Blocks</legend>
      {items.map((f, bi) => (
        <div key={f.id} className="border border-border rounded-lg p-3 space-y-2 bg-card">
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">Block #{bi + 1}</span>
            <button type="button" onClick={() => onChange(items.filter((_, j) => j !== bi))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
          </div>
          {f.items.map((it, ii) => (
            <div key={ii} className="border border-border/50 rounded p-2 space-y-1">
              <div className="flex gap-2">
                <input placeholder="Question" value={it.question} onChange={(e) => updateItem(bi, ii, { question: e.target.value })} className="flex-1 px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
                <button type="button" onClick={() => onChange(items.map((fb, si) => si === bi ? { ...fb, items: fb.items.filter((_, j) => j !== ii) } : fb))} className="p-1 text-brand-danger hover:text-brand-danger/80"><Trash2 size={14} /></button>
              </div>
              <textarea placeholder="Answer" value={it.answer} onChange={(e) => updateItem(bi, ii, { answer: e.target.value })} rows={2} className="w-full px-2 py-1.5 text-sm border border-border rounded bg-surface text-text" />
            </div>
          ))}
          <button type="button" onClick={() => addFaq(bi)} className="text-xs text-primary hover:underline">+ Add FAQ item</button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-sm text-primary hover:underline"><Plus size={14} /> Add FAQ section</button>
    </fieldset>
  );
}

/* ─── Main SectionEditor (updated) ─────────────────────────────────────────── */

interface SectionEditorProps {
  layout: CmsLayout;
  onChange: (layout: CmsLayout) => void;
}

export default function SectionEditor({ layout, onChange }: SectionEditorProps) {
  const [active, setActive] = useState<string>("slider");

  const tabs = [
    { key: "slider",       label: "Slider",       icon: Sliders,                count: layout.slider?.length ?? 0 },
    { key: "header",       label: "Banners",      icon: LayoutGrid,             count: layout.header?.length ?? 0 },
    { key: "body",         label: "Content",       icon: FileText,              count: layout.body?.length ?? 0 },
    { key: "lists",        label: "Lists",         icon: ListOrdered,           count: layout.lists?.length ?? 0 },
    { key: "hero",         label: "Hero",          icon: Zap,                   count: layout.hero?.length ?? 0 },
    { key: "textBlocks",   label: "Text",          icon: Type,                  count: layout.textBlocks?.length ?? 0 },
    { key: "images",       label: "Images",        icon: ImageIcon,             count: layout.images?.length ?? 0 },
    { key: "cta",          label: "CTA",           icon: MousePointer,          count: layout.cta?.length ?? 0 },
    { key: "stats",        label: "Stats",         icon: BarChart3,             count: layout.stats?.length ?? 0 },
    { key: "testimonials", label: "Testimonials",  icon: MessageSquareQuote,    count: layout.testimonials?.length ?? 0 },
    { key: "faq",          label: "FAQ",           icon: HelpCircle,            count: layout.faq?.length ?? 0 },
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
      {active === "hero" && (
        <HeroEditor
          items={layout.hero ?? []}
          onChange={(hero) => onChange({ ...layout, hero })}
        />
      )}
      {active === "textBlocks" && (
        <TextBlockEditor
          items={layout.textBlocks ?? []}
          onChange={(textBlocks) => onChange({ ...layout, textBlocks })}
        />
      )}
      {active === "images" && (
        <ImageBlockEditor
          items={layout.images ?? []}
          onChange={(images) => onChange({ ...layout, images })}
        />
      )}
      {active === "cta" && (
        <CtaEditor
          items={layout.cta ?? []}
          onChange={(cta) => onChange({ ...layout, cta })}
        />
      )}
      {active === "stats" && (
        <StatsEditor
          items={layout.stats ?? []}
          onChange={(stats) => onChange({ ...layout, stats })}
        />
      )}
      {active === "testimonials" && (
        <TestimonialsEditor
          items={layout.testimonials ?? []}
          onChange={(testimonials) => onChange({ ...layout, testimonials })}
        />
      )}
      {active === "faq" && (
        <FaqEditor
          items={layout.faq ?? []}
          onChange={(faq) => onChange({ ...layout, faq })}
        />
      )}
    </div>
  );
}
