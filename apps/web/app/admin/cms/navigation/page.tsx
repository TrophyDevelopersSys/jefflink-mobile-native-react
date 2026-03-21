"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Plus, Trash2 } from "lucide-react";
import {
  getCmsNavigation,
  upsertCmsNavigation,
} from "../../../../src/lib/cms-api";
import type { CmsPlatform, CmsNavigation, CmsNavigationItem } from "@jefflink/types";

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function swap<T>(arr: T[], i: number, j: number): T[] {
  const next = [...arr];
  [next[i], next[j]] = [next[j], next[i]];
  return next;
}

const NAV_KEYS = ["main_nav", "footer_nav", "mobile_nav", "sidebar_nav"];

export default function NavigationEditorPage() {
  const router = useRouter();
  const [navKey, setNavKey] = useState<string>("main_nav");
  const [platform, setPlatform] = useState<CmsPlatform>("ALL");
  const [items, setItems] = useState<(CmsNavigationItem & { _uid: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const nav = await getCmsNavigation(navKey, platform);
      if (nav?.items) {
        setItems(nav.items.map((item) => ({ ...item, _uid: uid() })));
        setPlatform(nav.platform);
      } else {
        setItems([]);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [navKey, platform]);

  useEffect(() => {
    void load();
  }, [load]);

  function updateItem(idx: number, patch: Partial<CmsNavigationItem>) {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)),
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { _uid: uid(), label: "", href: "", icon: undefined, children: [] },
    ]);
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── Children ────────────────────────────────────────────────────────────
  function addChild(parentIdx: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? {
              ...it,
              children: [
                ...(it.children ?? []),
                { label: "", href: "" },
              ],
            }
          : it,
      ),
    );
  }

  function updateChild(
    parentIdx: number,
    childIdx: number,
    patch: Partial<CmsNavigationItem>,
  ) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? {
              ...it,
              children: (it.children ?? []).map((c, ci) =>
                ci === childIdx ? { ...c, ...patch } : c,
              ),
            }
          : it,
      ),
    );
  }

  function removeChild(parentIdx: number, childIdx: number) {
    setItems((prev) =>
      prev.map((it, i) =>
        i === parentIdx
          ? {
              ...it,
              children: (it.children ?? []).filter((_, ci) => ci !== childIdx),
            }
          : it,
      ),
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Strip _uid before sending
      const cleanItems = items.map(({ _uid, ...rest }) => rest);
      await upsertCmsNavigation({ key: navKey, platform, items: cleanItems });
      setSuccess(`Navigation "${navKey}" saved!`);
    } catch {
      setError("Failed to save navigation.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Navigation Editor
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Manage menus for web, mobile, and footer
        </p>
      </div>

      {/* Key + platform selector */}
      <div className="flex gap-3 items-end">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Navigation Key
          </label>
          <select
            value={navKey}
            onChange={(e) => setNavKey(e.target.value)}
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
          >
            {NAV_KEYS.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
            Platform
          </label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as CmsPlatform)}
            className="px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
          >
            <option value="ALL">ALL</option>
            <option value="MOBILE">MOBILE</option>
            <option value="WEB">WEB</option>
          </select>
        </div>
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

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <div
              key={item._uid}
              className="border border-[var(--color-border)] rounded-lg p-4 space-y-3 bg-[var(--color-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">
                  Item #{idx + 1}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => idx > 0 && setItems(swap(items, idx, idx - 1))}
                    disabled={idx === 0}
                    className="p-1 disabled:opacity-30"
                  >
                    <ChevronUp size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      idx < items.length - 1 && setItems(swap(items, idx, idx + 1))
                    }
                    disabled={idx === items.length - 1}
                    className="p-1 disabled:opacity-30"
                  >
                    <ChevronDown size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="p-1 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input
                  placeholder="Label"
                  value={item.label}
                  onChange={(e) => updateItem(idx, { label: e.target.value })}
                  className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
                />
                <input
                  placeholder="Link (/about)"
                  value={item.href}
                  onChange={(e) => updateItem(idx, { href: e.target.value })}
                  className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
                />
                <input
                  placeholder="Icon (optional)"
                  value={item.icon ?? ""}
                  onChange={(e) =>
                    updateItem(idx, { icon: e.target.value || undefined })
                  }
                  className="px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
                />
              </div>

              {/* Children */}
              {(item.children ?? []).length > 0 && (
                <div className="ml-6 space-y-2">
                  {item.children!.map((child, ci) => (
                    <div key={ci} className="flex gap-2 items-center">
                      <span className="text-xs text-[var(--color-text-muted)]">↳</span>
                      <input
                        placeholder="Child label"
                        value={child.label}
                        onChange={(e) =>
                          updateChild(idx, ci, { label: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
                      />
                      <input
                        placeholder="Child link"
                        value={child.href}
                        onChange={(e) =>
                          updateChild(idx, ci, { href: e.target.value })
                        }
                        className="flex-1 px-2 py-1.5 text-sm border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeChild(idx, ci)}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={() => addChild(idx)}
                className="ml-6 flex items-center gap-1 text-xs text-[var(--color-primary)] hover:underline"
              >
                <Plus size={12} /> Add child
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-1 text-sm text-[var(--color-primary)] hover:underline"
          >
            <Plus size={14} /> Add navigation item
          </button>
        </div>
      )}

      {/* Save */}
      <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save Navigation"}
        </button>
      </div>
    </div>
  );
}
