"use client";

import React, { useEffect, useState, useCallback } from "react";
import { getPlatformSettings, updatePlatformSettings } from "../../../src/lib/admin-api";

interface PlatformSettings {
  finance: {
    defaultInterestRate: number;
    maxInstallmentMonths: number;
    currency: string;
    minDeposit: number;
  };
  moderation: {
    autoFlagReportThreshold: number;
    requireListingReview: boolean;
    vendorVerificationRequired: boolean;
  };
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    smsEnabled: boolean;
  };
  platform: {
    maintenanceMode: boolean;
    autoApproveVendors: boolean;
  };
  audit: {
    adminActionLogging: boolean;
    logRetention: string;
    ipCapture: boolean;
  };
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlatformSettings();
      setSettings(data as PlatformSettings);
    } catch {
      setError("Failed to load platform settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const updated = await updatePlatformSettings(settings);
      setSettings(updated as PlatformSettings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof PlatformSettings>(
    section: K,
    key: keyof PlatformSettings[K],
    value: PlatformSettings[K][typeof key],
  ) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: { ...settings[section], [key]: value },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const inputCls =
    "w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent";

  const ToggleRow = ({
    label,
    description,
    checked,
    onChange,
  }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-[var(--color-text)]">{label}</p>
        <p className="text-xs text-[var(--color-text-muted)]">{description}</p>
      </div>
      <label className="relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors">
        <input
          type="checkbox"
          checked={checked}
          onChange={() => onChange(!checked)}
          className="sr-only peer"
          aria-label={label}
        />
        <span
          className={`absolute inset-0 rounded-full transition-colors ${
            checked ? "bg-[var(--color-primary)]" : "bg-[var(--color-border)]"
          }`}
        />
        <span
          className={`absolute h-4 w-4 transform rounded-full bg-white transition-transform ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </label>
    </div>
  );

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">Platform Settings</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Global configuration for JeffLink Marketplace
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !settings}
          className="px-4 py-2 text-sm font-semibold rounded-lg bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          Settings saved successfully.
        </div>
      )}

      {settings && (
        <>
          {/* Finance */}
          <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Finance</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-[var(--color-text-muted)] mb-1 block">
                  Default Interest Rate (%)
                </label>
                <input
                  type="number"
                  value={settings.finance.defaultInterestRate}
                  onChange={(e) =>
                    update("finance", "defaultInterestRate", Number(e.target.value))
                  }
                  min={0}
                  max={100}
                  aria-label="Default Interest Rate"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] mb-1 block">
                  Max Installment Months
                </label>
                <input
                  type="number"
                  value={settings.finance.maxInstallmentMonths}
                  onChange={(e) =>
                    update("finance", "maxInstallmentMonths", Number(e.target.value))
                  }
                  min={1}
                  max={120}
                  aria-label="Max Installment Months"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] mb-1 block">Currency</label>
                <input
                  type="text"
                  value={settings.finance.currency}
                  onChange={(e) => update("finance", "currency", e.target.value)}
                  aria-label="Currency"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-[var(--color-text-muted)] mb-1 block">
                  Minimum Deposit (%)
                </label>
                <input
                  type="number"
                  value={settings.finance.minDeposit}
                  onChange={(e) =>
                    update("finance", "minDeposit", Number(e.target.value))
                  }
                  min={0}
                  max={100}
                  aria-label="Minimum Deposit"
                  className={inputCls}
                />
              </div>
            </div>
          </section>

          {/* Moderation */}
          <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Moderation</h2>
            <div className="text-sm">
              <label className="text-[var(--color-text-muted)] mb-1 block">
                Auto-flag listings after this many reports
              </label>
              <input
                type="number"
                value={settings.moderation.autoFlagReportThreshold}
                onChange={(e) =>
                  update("moderation", "autoFlagReportThreshold", Number(e.target.value))
                }
                min={1}
                max={50}
                aria-label="Auto-flag report threshold"
                className={`${inputCls} max-w-[200px]`}
              />
            </div>
            <ToggleRow
              label="Review listings before publish"
              description="All new listings require admin approval"
              checked={settings.moderation.requireListingReview}
              onChange={(v) => update("moderation", "requireListingReview", v)}
            />
            <ToggleRow
              label="Vendor verification required"
              description="Vendors must be verified before selling"
              checked={settings.moderation.vendorVerificationRequired}
              onChange={(v) => update("moderation", "vendorVerificationRequired", v)}
            />
          </section>

          {/* Notifications */}
          <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Notifications</h2>
            <ToggleRow
              label="Email notifications"
              description="Send transactional emails to users"
              checked={settings.notifications.emailEnabled}
              onChange={(v) => update("notifications", "emailEnabled", v)}
            />
            <ToggleRow
              label="Push notifications"
              description="Send push notifications to mobile devices"
              checked={settings.notifications.pushEnabled}
              onChange={(v) => update("notifications", "pushEnabled", v)}
            />
            <ToggleRow
              label="SMS notifications"
              description="Send SMS messages (carrier charges may apply)"
              checked={settings.notifications.smsEnabled}
              onChange={(v) => update("notifications", "smsEnabled", v)}
            />
          </section>

          {/* Platform */}
          <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Platform</h2>
            <ToggleRow
              label="Maintenance mode"
              description="Disable public access and show maintenance page"
              checked={settings.platform.maintenanceMode}
              onChange={(v) => update("platform", "maintenanceMode", v)}
            />
            <ToggleRow
              label="Auto-approve vendors"
              description="Skip manual verification for new vendors"
              checked={settings.platform.autoApproveVendors}
              onChange={(v) => update("platform", "autoApproveVendors", v)}
            />
          </section>

          {/* Audit & Compliance */}
          <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
            <h2 className="text-base font-semibold text-[var(--color-text)]">
              Audit &amp; Compliance
            </h2>
            <ToggleRow
              label="Admin action logging"
              description="Record all admin actions to the audit trail"
              checked={settings.audit.adminActionLogging}
              onChange={(v) => update("audit", "adminActionLogging", v)}
            />
            <ToggleRow
              label="IP address capture"
              description="Log IP addresses for admin operations"
              checked={settings.audit.ipCapture}
              onChange={(v) => update("audit", "ipCapture", v)}
            />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-[var(--color-text)]">
                  Log retention
                </p>
                <p className="text-xs text-[var(--color-text-muted)]">How long audit logs are kept</p>
              </div>
              <span className="text-sm font-semibold text-[var(--color-primary)] capitalize">
                {settings.audit.logRetention}
              </span>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
