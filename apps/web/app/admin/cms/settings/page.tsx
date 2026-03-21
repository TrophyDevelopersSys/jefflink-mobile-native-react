"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCmsSettings, updateCmsSettings } from "../../../../src/lib/cms-api";
import type { CmsSettings } from "@jefflink/types";

export default function CmsSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [appName, setAppName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [currencyDisplay, setCurrencyDisplay] = useState("UGX");
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [newFeatureKey, setNewFeatureKey] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getCmsSettings();
      if (settings) {
        setAppName(settings.appName ?? "");
        setSupportEmail(settings.supportEmail ?? "");
        setContactPhone(settings.contactPhone ?? "");
        setCurrencyDisplay(settings.currencyDisplay ?? "UGX");
        setFeatures(settings.features ?? {});
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      await updateCmsSettings({
        appName,
        supportEmail,
        contactPhone,
        currencyDisplay,
        features,
      });
      setSuccess("Settings saved!");
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  function toggleFeature(key: string) {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function addFeature() {
    const key = newFeatureKey.trim();
    if (!key || key in features) return;
    setFeatures((prev) => ({ ...prev, [key]: false }));
    setNewFeatureKey("");
  }

  function removeFeature(key: string) {
    setFeatures((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-primary)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          Site Settings
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Global CMS configuration
        </p>
      </div>

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
        {/* General */}
        <fieldset className="border border-[var(--color-border)] rounded-lg p-4 space-y-4">
          <legend className="text-sm font-semibold text-[var(--color-text)] px-1">
            General
          </legend>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              App Name
            </label>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="JeffLink"
              className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@jefflinkcars.com"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+256 700 000000"
                className="w-full px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1">
              Currency Display
            </label>
            <input
              value={currencyDisplay}
              onChange={(e) => setCurrencyDisplay(e.target.value)}
              placeholder="UGX"
              className="w-64 px-3 py-2 text-sm border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)]"
            />
          </div>
        </fieldset>

        {/* Feature Flags */}
        <fieldset className="border border-[var(--color-border)] rounded-lg p-4 space-y-3">
          <legend className="text-sm font-semibold text-[var(--color-text)] px-1">
            Feature Flags
          </legend>
          {Object.keys(features).length === 0 && (
            <p className="text-sm text-[var(--color-text-muted)]">
              No feature flags set.
            </p>
          )}
          {Object.entries(features).map(([key, enabled]) => (
            <div
              key={key}
              className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleFeature(key)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    enabled
                      ? "bg-green-500"
                      : "bg-[var(--color-border)]"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      enabled ? "translate-x-5" : "translate-x-0.5"
                    }`}
                  />
                </button>
                <span className="text-sm text-[var(--color-text)] font-mono">
                  {key}
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFeature(key)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}

          <div className="flex gap-2 pt-2">
            <input
              value={newFeatureKey}
              onChange={(e) => setNewFeatureKey(e.target.value)}
              placeholder="new_feature_key"
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addFeature())}
              className="flex-1 px-2 py-1.5 text-sm font-mono border border-[var(--color-border)] rounded bg-[var(--color-surface)] text-[var(--color-text)]"
            />
            <button
              type="button"
              onClick={addFeature}
              className="px-3 py-1.5 text-sm text-[var(--color-primary)] border border-[var(--color-primary)] rounded hover:bg-[var(--color-primary)] hover:text-white transition-colors"
            >
              + Add Flag
            </button>
          </div>
        </fieldset>

        {/* Save */}
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 text-sm font-medium rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
