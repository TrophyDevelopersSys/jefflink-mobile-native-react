import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ListingDetail } from "@jefflink/types";

const API =
  process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1";

async function getCommercial(id: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API}/listings/${id}`, {
      next: { revalidate: 0 },
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getCommercial(id);
  if (!listing) return { title: "Listing Not Found" };
  return {
    title: `${listing.title} | JeffLink`,
    description:
      listing.description ??
      `${listing.title} in ${listing.location}. Price: ${listing.price}`,
    openGraph: {
      title: `${listing.title} | JeffLink`,
      images: listing.coverUrl ? [listing.coverUrl] : [],
    },
  };
}

export default async function CommercialDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getCommercial(id);
  if (!listing) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <nav className="text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          {" / "}
          <Link href="/commercial" className="hover:text-white transition-colors">
            Commercial
          </Link>
          {" / "}
          <span className="text-white">{listing.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-[4/3] bg-brand-slate rounded-card overflow-hidden">
            {listing.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.coverUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🏢
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white">{listing.title}</h1>
            <p className="text-3xl font-bold text-brand-accent">{listing.price}</p>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <span>📍</span>
              <span>{listing.location}</span>
            </div>

            {listing.description && (
              <p className="text-text-muted text-sm leading-relaxed">
                {listing.description}
              </p>
            )}

            {listing.attributes && Object.keys(listing.attributes).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(listing.attributes).map(([key, value]) => (
                  <div
                    key={key}
                    className="bg-card border border-border rounded-input p-3"
                  >
                    <p className="text-text-muted text-xs capitalize">{key}</p>
                    <p className="text-white text-sm font-medium mt-0.5">
                      {String(value)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/contact?listingId=${listing.id}`}
              className="mt-2 bg-brand-primary text-white px-6 py-3 rounded-button font-semibold text-center hover:bg-brand-primary/90 transition-colors"
            >
              Contact Vendor
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
