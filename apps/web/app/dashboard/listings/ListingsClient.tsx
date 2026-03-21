"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthContext } from "../../../src/context/AuthContext";
import { canManageListings } from "../../../src/lib/roles";

export default function ListingsClient() {
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
          <p className="text-text-muted text-sm">Loading listings…</p>
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user) return null;

  const canManageListingsAccess = canManageListings(user.role);

  if (!canManageListingsAccess) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <nav className="text-sm text-text-muted mb-6">
            <Link href="/dashboard" className="hover:text-text transition-colors">
              Dashboard
            </Link>
            {" / "}
            <span className="text-text">My Listings</span>
          </nav>

          <section className="bg-card border border-border rounded-card p-8 text-center">
            <h1 className="text-xl font-bold text-text mb-2">My Listings</h1>
            <p className="text-text-muted text-sm mb-6">
              Listings management is available to dealer and admin accounts.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-button hover:bg-brand-primary/90 transition-colors"
              >
                Back to Dashboard
              </Link>
              <Link
                href="/sell"
                className="bg-brand-accent text-black text-sm font-semibold px-5 py-2.5 rounded-button hover:bg-brand-accent/90 transition-colors"
              >
                Become a Seller
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <nav className="text-sm text-text-muted mb-6">
          <Link href="/dashboard" className="hover:text-text transition-colors">
            Dashboard
          </Link>
          {" / "}
          <span className="text-text">My Listings</span>
        </nav>

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-text">My Listings</h1>
            <p className="text-text-muted text-sm mt-1">
              Manage your posts, monitor status, and publish new inventory.
            </p>
          </div>
          <Link
            href="/sell"
            className="bg-brand-accent text-black text-sm font-bold px-5 py-2.5 rounded-button hover:bg-brand-accent/90 transition-colors"
          >
            + New Listing
          </Link>
        </div>

        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Active" value="0" />
          <StatCard label="Pending" value="0" />
          <StatCard label="Rejected" value="0" />
          <StatCard label="Sold" value="0" />
        </section>

        <section className="bg-card border border-border rounded-card p-8 text-center">
          <h2 className="text-lg font-semibold text-text mb-2">No listings yet</h2>
          <p className="text-text-muted text-sm mb-6">
            Your created listings will appear here after you publish them.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/sell"
              className="bg-brand-primary text-white text-sm font-semibold px-5 py-2.5 rounded-button hover:bg-brand-primary/90 transition-colors"
            >
              Post Your First Listing
            </Link>
            <Link
              href="/search"
              className="bg-card border border-border text-text text-sm font-medium px-5 py-2.5 rounded-button hover:border-brand-primary/40 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card border border-border rounded-card p-4">
      <p className="text-text-muted text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-text font-bold text-2xl">{value}</p>
    </div>
  );
}
