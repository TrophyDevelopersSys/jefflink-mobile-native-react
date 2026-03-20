"use client";

import React from "react";
import { brand } from "@jefflink/design-tokens";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Store,
  Car,
  FileText,
  CreditCard,
  CalendarClock,
  Banknote,
  Flag,
  Search,
  Settings,
  LogOut,
  type LucideIcon,
} from "lucide-react";
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

const NAV_ITEMS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "dashboard",    label: "Dashboard",    Icon: LayoutDashboard },
  { key: "users",        label: "Users",        Icon: Users },
  { key: "vendors",      label: "Vendors",      Icon: Store },
  { key: "listings",     label: "Listings",     Icon: Car },
  { key: "contracts",    label: "Contracts",    Icon: FileText },
  { key: "payments",     label: "Payments",     Icon: CreditCard },
  { key: "installments", label: "Installments", Icon: CalendarClock },
  { key: "withdrawals",  label: "Withdrawals",  Icon: Banknote },
  { key: "reports",      label: "Reports",      Icon: Flag },
  { key: "audit-logs",   label: "Audit Logs",   Icon: Search },
  { key: "settings",     label: "Settings",     Icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const { user, signOut } = useAuth();

  const role     = user?.role ?? "CUSTOMER";
  const allowed  = ROLE_MENUS[role] ?? [];
  const visibleItems = NAV_ITEMS.filter((item) => allowed.includes(item.key));

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <aside className="flex flex-col w-60 min-h-screen bg-[var(--color-surface)] border-r border-[var(--color-border)] shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--color-border)]">
        <img
          src={brand.assets.logo.primary}
          alt={brand.name}
          className="h-9 w-auto"
          draggable={false}
        />
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
          const href   = `/admin/${item.key}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
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
              <item.Icon size={16} strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[var(--color-border)]">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 w-full text-sm text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors px-2 py-1.5"
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
