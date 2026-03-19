"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../src/context/AuthContext";
import Link from "next/link";
import { Search, Car, LandPlot, Store, Plus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isAdminRole, isDealerRole, roleLabel } from "../../src/lib/roles";

export default function DashboardPage() {
  const { user, isAuthenticated, status } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (status !== "loading" && !isAuthenticated) {
      router.replace("/login");
    }
  }, [status, isAuthenticated, router]);

  if (status === "loading" || status === "idle") {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-brand-muted text-sm">Loading dashboard…</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  const isDealer = isDealerRole(user.role);
  const isAdmin = isAdminRole(user.role);
  const displayName = user.name ?? user.email ?? "User";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-brand-primary/20 text-brand-accent flex items-center justify-center font-bold text-xl border border-brand-primary/30">
              {initials}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                Welcome back, {displayName.split(" ")[0]}
              </h1>
              <p className="text-brand-muted text-sm mt-0.5">
                {isAdmin ? "Admin" : isDealer ? "Dealer Account" : "Customer Account"}
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/profile"
            className="text-sm text-brand-accent hover:underline"
          >
            Edit Profile →
          </Link>
        </div>

        {/* Role badge */}
        <div className="flex gap-2 mb-8">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isAdmin
              ? "bg-brand-warning/20 text-brand-warning"
              : isDealer
              ? "bg-brand-primary/20 text-brand-accent"
              : "bg-brand-slate text-brand-muted"
          }`}>
            {isAdmin ? "Admin" : isDealer ? "Verified Dealer" : "Customer"}
          </span>
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <h2 className="text-base font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <QuickActionCard href="/search" icon={Search} label="Search Listings" />
            <QuickActionCard href="/cars" icon={Car} label="Browse Cars" />
            <QuickActionCard href="/land" icon={LandPlot} label="Browse Land" />
            {isDealer || isAdmin ? (
              <QuickActionCard href="/sell" icon={Plus} label="Post Listing" highlight />
            ) : (
              <QuickActionCard href="/vendors" icon={Store} label="Find Vendors" />
            )}
          </div>
        </section>

        {/* Dealer-specific sections */}
        {(isDealer || isAdmin) && (
          <>
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-white">My Listings</h2>
                <Link href="/dashboard/listings" className="text-xs text-brand-accent hover:underline">
                  View all →
                </Link>
              </div>
              <DealerListingsPreview />
            </section>

            <section className="mb-8">
              <h2 className="text-base font-semibold text-white mb-4">Performance Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Active Listings" value="–" />
                <StatCard label="Total Views" value="–" />
                <StatCard label="Leads" value="–" />
                <StatCard label="Wallet" value="ZMW 0" />
              </div>
              <p className="text-brand-muted text-xs mt-3">
                Analytics update in real-time from the JeffLink backend.
              </p>
            </section>
          </>
        )}

        {/* Customer sections */}
        {!isDealer && !isAdmin && (
          <section className="mb-8">
            <h2 className="text-base font-semibold text-white mb-4">Recent Activity</h2>
            <div className="bg-card border border-border rounded-card p-6 text-center text-brand-muted text-sm">
              <p className="mb-2">No recent activity yet.</p>
              <p>
                Start by{" "}
                <Link href="/cars" className="text-brand-accent hover:underline">
                  browsing listings
                </Link>{" "}
                or{" "}
                <Link href="/search" className="text-brand-accent hover:underline">
                  searching the marketplace
                </Link>
                .
              </p>
            </div>
          </section>
        )}

        {/* Account info */}
        <section className="bg-card border border-border rounded-card p-6">
          <h2 className="text-base font-semibold text-white mb-4">Account Details</h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <dt className="text-brand-muted text-xs uppercase tracking-wide mb-1">Name</dt>
              <dd className="text-white text-sm">{user.name ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-brand-muted text-xs uppercase tracking-wide mb-1">Email</dt>
              <dd className="text-white text-sm">{user.email ?? "Not set"}</dd>
            </div>
            <div>
              <dt className="text-brand-muted text-xs uppercase tracking-wide mb-1">Role</dt>
              <dd className="text-white text-sm">{roleLabel(user.role)}</dd>
            </div>
            <div>
              <dt className="text-brand-muted text-xs uppercase tracking-wide mb-1">User ID</dt>
              <dd className="text-brand-muted text-xs font-mono">{user.id}</dd>
            </div>
          </dl>
          <div className="mt-5 pt-4 border-t border-border">
            <Link
              href="/dashboard/profile"
              className="inline-block bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-button hover:bg-brand-primary/90 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function QuickActionCard({
  href,
  icon: Icon,
  label,
  highlight = false,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center gap-2 rounded-card p-4 border transition-colors text-center ${
        highlight
          ? "bg-brand-primary/20 border-brand-primary/40 hover:bg-brand-primary/30"
          : "bg-card border-border hover:border-brand-primary/40"
      }`}
    >
      <Icon size={24} strokeWidth={1.75} className="text-brand-accent" />
      <span className="text-xs font-medium text-white leading-tight">{label}</span>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-card p-4">
      <p className="text-brand-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-white font-bold text-xl">{value}</p>
    </div>
  );
}

function DealerListingsPreview() {
  return (
    <div className="bg-card border border-border rounded-card p-6 text-center text-brand-muted text-sm">
      <p className="mb-2">Your active listings will appear here.</p>
      <p>
        <Link href="/sell" className="text-brand-accent hover:underline">
          Post your first listing →
        </Link>
      </p>
    </div>
  );
}
