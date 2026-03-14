"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

// ── Role → accessible admin sections ─────────────────────────────────────────
const ROLE_MENUS: Record<string, string[]> = {
  SUPER_ADMIN:    ["dashboard","users","vendors","listings","contracts","payments","reports","audit-logs","settings"],
  ADMIN:          ["dashboard","users","vendors","listings","contracts","payments","reports"],
  SYSTEM_ADMIN:   ["dashboard","users","vendors","listings","contracts","payments","reports","audit-logs"],
  DIRECTOR:       ["dashboard","users","vendors","contracts","payments","audit-logs"],
  MANAGER:        ["dashboard","users","vendors","listings","reports"],
  FINANCE_ADMIN:  ["dashboard","contracts","payments","installments","withdrawals"],
  FINANCE_OFFICER:["dashboard","contracts","payments","installments"],
  AUDITOR:        ["dashboard","contracts","payments","installments","audit-logs"],
  MODERATOR:      ["dashboard","listings","reports"],
  SUPPORT:        ["dashboard","users","reports"],
};

const NAV_ITEMS = [
  { key: "dashboard",    label: "Dashboard",    icon: "⊞" },
  { key: "users",        label: "Users",        icon: "👥" },
  { key: "vendors",      label: "Vendors",      icon: "🏪" },
  { key: "listings",     label: "Listings",     icon: "🚗" },
  { key: "contracts",    label: "Contracts",    icon: "📄" },
  { key: "payments",     label: "Payments",     icon: "💳" },
  { key: "installments", label: "Installments", icon: "📅" },
  { key: "withdrawals",  label: "Withdrawals",  icon: "💰" },
  { key: "reports",      label: "Reports",      icon: "🚩" },
  { key: "audit-logs",   label: "Audit Logs",   icon: "🔍" },
  { key: "settings",     label: "Settings",     icon: "⚙️" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, signOut } = useAuth();

  const role     = user?.role ?? "ADMIN";
  const allowed  = ROLE_MENUS[role] ?? ROLE_MENUS["ADMIN"];
  const visibleItems = NAV_ITEMS.filter((item) => allowed.includes(item.key));

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-[var(--color-border)]">
        <span className="text-[var(--color-primary)] font-extrabold text-xl tracking-tight">
          JeffLink
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-primary)] text-white font-semibold ml-1">
          Admin
        </span>
      </div>

      {/* Role badge */}
      <div className="px-5 py-3 border-b border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)]">Signed in as</p>
        <p className="text-sm font-semibold text-[var(--color-text)] truncate">{user?.name ?? user?.email ?? "—"}</p>
        <span className="text-xs font-medium text-[var(--color-primary)]">{role}</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {visibleItems.map((item) => {
          const href    = `/admin/${item.key}`;
          const active  = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.key}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleSignOut}
          className="w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors text-left px-2 py-1.5"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
