import type { Metadata } from "next";
import React from "react";
import { AdminSidebar } from "../../src/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s | JeffLink Admin" },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
