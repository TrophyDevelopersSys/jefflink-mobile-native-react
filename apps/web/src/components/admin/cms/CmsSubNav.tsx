"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Navigation, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Tab {
  key: string;
  label: string;
  href: string;
  Icon: LucideIcon;
  /** Paths that activate this tab (checked with startsWith) */
  match: string[];
}

const TABS: Tab[] = [
  {
    key: "pages",
    label: "Pages",
    href: "/admin/cms",
    Icon: FileText,
    match: ["/admin/cms/pages", "/admin/cms"],
  },
  {
    key: "navigation",
    label: "Navigation",
    href: "/admin/cms/navigation",
    Icon: Navigation,
    match: ["/admin/cms/navigation"],
  },
  {
    key: "settings",
    label: "Settings",
    href: "/admin/cms/settings",
    Icon: Settings,
    match: ["/admin/cms/settings"],
  },
];

function isActive(pathname: string, tab: Tab): boolean {
  // Exact match for the "Pages" tab root
  if (tab.key === "pages" && pathname === "/admin/cms") return true;
  // Prefix match for sub-paths
  return tab.match.some(
    (m) => m !== "/admin/cms" && pathname.startsWith(m),
  );
}

/**
 * Breadcrumb: optional trail rendered above the tabs on sub-pages.
 * Example: CMS › Pages › New Page
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function CmsBreadcrumb({ items }: { items: BreadcrumbItem[] }) {
  if (!items.length) return null;

  return (
    <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mb-2">
      <Link
        href="/admin/cms"
        className="hover:text-[var(--color-text)] transition-colors"
      >
        CMS
      </Link>
      {items.map((item, i) => (
        <React.Fragment key={i}>
          <span className="text-[var(--color-border)]">›</span>
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-[var(--color-text)] transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--color-text)]">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

export function CmsSubNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-[var(--color-border)] mb-6">
      <nav className="flex gap-1">
        {TABS.map((tab) => {
          const active = isActive(pathname, tab);
          return (
            <Link
              key={tab.key}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
                active
                  ? "border-[var(--color-primary)] text-[var(--color-primary)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
              }`}
            >
              <tab.Icon size={15} strokeWidth={1.75} />
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
