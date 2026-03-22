"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../src/context/AuthContext";
import Link from "next/link";
import { Search, Car, LandPlot, Store, Plus, User, Shield, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { isAdminRole, isDealerRole, roleLabel } from "../../src/lib/roles";
import { Card, CardHeader } from "../../src/components/ui/Card";
import { Badge } from "../../src/components/ui/Badge";
import { Button } from "../../src/components/ui/Button";
import { Section } from "../../src/components/ui/Section";

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
          <p className="text-text-muted text-sm">Loading dashboard…</p>
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
              <h1 className="text-xl font-bold text-text">
                Welcome back, {displayName.split(" ")[0]}
              </h1>
              <p className="text-text-muted text-sm mt-0.5">
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
          <Badge
            variant={isAdmin ? "warning" : isDealer ? "primary" : "default"}
            icon={isAdmin ? Shield : isDealer ? BadgeCheck : User}
          >
            {isAdmin ? "Admin" : isDealer ? "Verified Dealer" : "Customer"}
          </Badge>
        </div>

        {/* Quick Actions */}
        <Section title="Quick Actions" className="mb-8">
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
        </Section>
        {(isDealer || isAdmin) && (
          <>
            <Section
              title="My Listings"
              className="mb-8"
              action={
                <Link href="/dashboard/listings" className="text-xs text-brand-accent hover:underline">
                  View all &rarr;
                </Link>
              }
            >
              <DealerListingsPreview />
            </Section>

            <Section title="Performance Overview" className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard label="Active Listings" value="–" />
                <StatCard label="Total Views" value="–" />
                <StatCard label="Leads" value="–" />
                <StatCard label="Wallet" value="ZMW 0" />
              </div>
              <p className="text-text-muted text-xs mt-3">
                Analytics update in real-time from the JeffLink backend.
              </p>
            </Section>
          </>
        )}

        {/* Customer sections */}
        {!isDealer && !isAdmin && (
          <Section title="Recent Activity" className="mb-8">
            <Card>
              <div className="p-6 text-center text-text-muted text-sm">
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
            </Card>
          </Section>
        )}

        {/* Account info */}
        <Card>
          <CardHeader title="Account Details" />
          <div className="px-6 pb-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wide mb-1">Name</dt>
                <dd className="text-text text-sm">{user.name ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wide mb-1">Email</dt>
                <dd className="text-text text-sm">{user.email ?? "Not set"}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wide mb-1">Role</dt>
                <dd className="text-text text-sm">{roleLabel(user.role)}</dd>
              </div>
              <div>
                <dt className="text-text-muted text-xs uppercase tracking-wide mb-1">User ID</dt>
                <dd className="text-text-muted text-xs font-mono">{user.id}</dd>
              </div>
            </dl>
            <div className="mt-5 pt-4 border-t border-border">
              <Link
                href="/dashboard/profile"
                className="inline-block bg-brand-primary text-white text-sm font-semibold px-4 py-2 rounded-button hover:bg-brand-primary/90 transition-colors"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </Card>
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
      <span className="text-xs font-medium text-text leading-tight">{label}</span>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Card padding="sm">
      <p className="text-text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-text font-bold text-xl">{value}</p>
    </Card>
  );
}

function DealerListingsPreview() {
  return (
    <Card>
      <div className="p-6 text-center text-text-muted text-sm">
        <p className="mb-2">Your active listings will appear here.</p>
        <p>
          <Link href="/sell" className="text-brand-accent hover:underline">
            Post your first listing &rarr;
          </Link>
        </p>
      </div>
    </Card>
  );
}
