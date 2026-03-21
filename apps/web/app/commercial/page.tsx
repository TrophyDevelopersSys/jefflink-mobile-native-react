import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Building2 } from "lucide-react";
import type { ListingSummary } from "@jefflink/types";

export const metadata: Metadata = {
  title: "Commercial Property for Sale in Uganda | JeffLink",
  description:
    "Browse commercial properties for sale and lease across Uganda. Offices, warehouses, and retail spaces.",
  keywords: [
    "commercial property Uganda",
    "office space Kampala",
    "warehouse Uganda",
    "retail space Uganda",
  ],
};

export const revalidate = 60;

const API =
  process.env["INTERNAL_API_URL"] ?? "https://api.jefflinkcars.com/api/v1";

async function getCommercialListings(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${API}/listings?type=commercial&limit=20`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CommercialPage() {
  const listings = await getCommercialListings();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Commercial Property</h1>
          <p className="text-text-muted mt-2">
            {listings.length > 0
              ? `${listings.length} listings available`
              : "Explore our growing inventory"}
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-24">
            <Building2 size={64} strokeWidth={1.5} className="text-text-muted mx-auto mb-4" />
            <p className="text-text-muted text-lg">
              No commercial listings available yet.
            </p>
            <p className="text-text-muted text-sm mt-2">Check back soon.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/commercial/${listing.id}`}
                className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group"
              >
                <div className="aspect-[4/3] bg-card relative overflow-hidden">
                  {listing.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.coverUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Building2 size={48} strokeWidth={1.5} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="text-text font-semibold text-sm line-clamp-1 mb-1">
                    {listing.title}
                  </h2>
                  <p className="text-text-muted text-xs mb-2">{listing.location}</p>
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

