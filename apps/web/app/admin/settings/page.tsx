export default function AdminSettingsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Platform Settings</h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          Global configuration for JeffLink Marketplace
        </p>
      </div>

      {/* Sections */}
      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Finance</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-muted)] mb-1">Default Interest Rate (%)</p>
            <input
              type="number"
              defaultValue={12}
              disabled
              title="Default interest rate"
              placeholder="12"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] opacity-60 cursor-not-allowed"
            />
          </div>
          <div>
            <p className="text-[var(--color-text-muted)] mb-1">Max Installment Months</p>
            <input
              type="number"
              defaultValue={60}
              disabled
              title="Max installment months"
              placeholder="60"
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] text-[var(--color-text)] opacity-60 cursor-not-allowed"
            />
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-muted)]">
          Finance settings are managed via environment configuration. Contact a SUPER_ADMIN to modify.
        </p>
      </section>

      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Moderation</h2>
        <div className="text-sm text-[var(--color-text-muted)] space-y-2">
          <p>Auto-flag listings with reports ≥ 3: <strong className="text-[var(--color-text)]">Enabled</strong></p>
          <p>Review listings before publish: <strong className="text-[var(--color-text)]">Enabled</strong></p>
          <p>Vendor verification required: <strong className="text-[var(--color-text)]">Enabled</strong></p>
        </div>
      </section>

      <section className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6 space-y-4">
        <h2 className="text-base font-semibold text-[var(--color-text)]">Audit & Compliance</h2>
        <div className="text-sm text-[var(--color-text-muted)] space-y-2">
          <p>Admin action logging: <strong className="text-[var(--color-text)]">Always on (immutable)</strong></p>
          <p>Audit log retention: <strong className="text-[var(--color-text)]">Indefinite</strong></p>
          <p>IP address capture: <strong className="text-[var(--color-text)]">Enabled</strong></p>
        </div>
      </section>

      <div className="text-xs text-[var(--color-text-muted)]">
        Full runtime configuration is managed via <code className="bg-[var(--color-border)] px-1 py-0.5 rounded">.env</code> and the NestJS config module.
        Settings visible here reflect current platform defaults.
      </div>
    </div>
  );
}
