import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ListingSummary } from "@jefflink/types";

export const metadata: Metadata = {
  title: "Land & Property for Sale in Uganda",
  description:
    "Browse land plots, apartments, and commercial properties across Uganda. Verified listings with direct owner contact.",
  keywords: ["land for sale Uganda", "property Uganda", "plots Kampala", "apartments Uganda"],
};

// Render dynamically at request time — avoids cold-start timeouts during build.
export const dynamic = "force-dynamic";

async function getLandListings(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(
      `${process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1"}/listings?type=property&limit=20`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function LandPage() {
  const listings = await getLandListings();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Land &amp; Property</h1>
          <p className="text-text-muted mt-2">
            {listings.length > 0
              ? `${listings.length} properties available`
              : "Explore our growing property inventory"}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-brand-muted text-lg">No property listings yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/land/${listing.id}`}
                className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group"
              >
                <div className="aspect-[4/3] bg-brand-slate relative overflow-hidden">
                  {listing.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.coverUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🏘️
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-white font-semibold text-sm line-clamp-1 mb-1">
                    {listing.title}
                  </h2>
                  <p className="text-brand-muted text-xs mb-2">{listing.location}</p>
                  <p className="text-brand-accent font-bold">{listing.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
