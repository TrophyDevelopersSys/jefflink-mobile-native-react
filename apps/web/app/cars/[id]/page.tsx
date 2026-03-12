import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { ListingDetail } from "@jefflink/types";

const API = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1";

async function getCar(id: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API}/listings/${id}`, {
      next: { revalidate: 0 }, // SSR — always fresh
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
  const car = await getCar(id);
  if (!car) return { title: "Car Not Found" };
  return {
    title: car.title,
    description: car.description ?? `${car.title} for sale in ${car.location}. Price: ${car.price}`,
    openGraph: {
      title: `${car.title} | JeffLink`,
      images: car.coverUrl ? [car.coverUrl] : [],
    },
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = await getCar(id);
  if (!car) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          {" / "}
          <Link href="/cars" className="hover:text-white transition-colors">
            Cars
          </Link>
          {" / "}
          <span className="text-white">{car.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-[4/3] bg-brand-slate rounded-card overflow-hidden">
            {car.coverUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={car.coverUrl}
                alt={car.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                🚗
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col gap-4">
            <h1 className="text-2xl font-bold text-white">{car.title}</h1>
            <p className="text-3xl font-bold text-brand-accent">{car.price}</p>
            <div className="flex items-center gap-2 text-text-muted text-sm">
              <span>📍</span>
              <span>{car.location}</span>
            </div>

            {car.description && (
              <p className="text-text-muted text-sm leading-relaxed">
                {car.description}
              </p>
            )}

            {/* Attributes */}
            {car.attributes && Object.keys(car.attributes).length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(car.attributes).map(([key, value]) => (
                  <div key={key} className="bg-card border border-border rounded-input p-3">
                    <p className="text-text-muted text-xs capitalize">{key}</p>
                    <p className="text-white text-sm font-medium mt-0.5">{String(value)}</p>
                  </div>
                ))}
              </div>
            )}

            <Link
              href={`/contact?listingId=${car.id}`}
              className="mt-2 bg-brand-primary text-white px-6 py-3 rounded-button font-semibold text-center hover:bg-brand-primary/90 transition-colors"
            >
              Contact Dealer
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
