import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import type { ListingSummary } from "@jefflink/types";

export const metadata: Metadata = {
  title: "Cars for Sale in Uganda",
  description:
    "Browse hundreds of cars for sale across Uganda. Verified dealers, competitive prices, and direct contact.",
  keywords: ["cars for sale Uganda", "buy car Uganda", "used cars Kampala"],
};

// ISR — revalidate every 60 seconds
export const revalidate = 60;

async function getCars(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(
      `${process.env["INTERNAL_API_URL"] ?? "https://jefflink.onrender.com/api/v1"}/listings?type=vehicle&limit=20`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function CarsPage() {
  const cars = await getCars();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Cars for Sale</h1>
          <p className="text-text-muted mt-2">
            {cars.length > 0
              ? `${cars.length} listings available`
              : "Explore our growing inventory"}
          </p>
        </div>

        {cars.length === 0 ? (
          <EmptyListings type="cars" />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <ListingCard key={car.id} listing={car} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function ListingCard({ listing }: { listing: ListingSummary }) {
  return (
    <Link
      href={`/cars/${listing.id}`}
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
          <div className="w-full h-full flex items-center justify-center text-brand-muted text-4xl">
            🚗
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
  );
}

function EmptyListings({ type }: { type: string }) {
  return (
    <div className="text-center py-24">
      <p className="text-brand-muted text-lg">No {type} listings available yet.</p>
      <p className="text-brand-muted text-sm mt-2">Check back soon.</p>
    </div>
  );
}
