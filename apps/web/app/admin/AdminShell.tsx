"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthContext } from "../../src/context/AuthContext";
import { isAdminRole } from "../../src/lib/roles";
import { AdminSidebar } from "../../src/components/admin/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, status } = useAuthContext();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading" || status === "idle") return;

    if (!isAuthenticated) {
      const next = pathname ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/login${next}`);
      return;
    }

    if (!isAdminRole(user?.role)) {
      router.replace("/dashboard");
    }
  }, [status, isAuthenticated, user?.role, pathname, router]);

  if (status === "loading" || status === "idle") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-sm">Loading admin workspace…</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !isAdminRole(user?.role)) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-[var(--color-background)]">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        <div className="max-w-screen-xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
