import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Search, MessageCircle, Handshake, Car, LandPlot } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import HeroCarousel from "../src/components/HeroCarousel";
import SearchFilterBar from "../src/components/SearchFilterBar";
import type { ListingSummary } from "@jefflink/types";

export const metadata: Metadata = {
  title: "JeffLink — Uganda's Marketplace",
  description:
    "Find cars, land, and connect with verified dealers across Uganda.",
};

export const revalidate = 60;

const API = process.env["INTERNAL_API_URL"] ?? "https://api.jefflinkcars.com/api/v1";

// ── Data fetchers (mirrors ListingCarousel + FeaturedListingsCarousel API calls) ──

async function getLatestCars(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${API}/listings?type=vehicle&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

async function getLatestLand(): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${API}/listings?type=property&subtype=land&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

async function getFeaturedListings(): Promise<ListingSummary[]> {
  try {
    // Try featured endpoint first (mirrors FeaturedListingsCarousel)
    const res = await fetch(`${API}/listings?featured=true&limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

interface VendorSummary {
  id: string;
  businessName: string;
  category: string;
  city: string;
  isVerified: boolean;
  listingCount: number;
  avatarUrl?: string;
}

async function getVendors(): Promise<VendorSummary[]> {
  try {
    const res = await fetch(`${API}/vendors?limit=8`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch { return []; }
}

export default async function HomePage() {
  const [cars, land, vendors, featured] = await Promise.all([
    getLatestCars(),
    getLatestLand(),
    getVendors(),
    getFeaturedListings(),
  ]);

  return (
    <main className="min-h-screen bg-background">

      {/* ── 1. HeroCarousel — matches mobile HeroCarousel ── */}
      <HeroCarousel />

      {/* ── 2. GlobalSearchBar (web: SearchFilterBar) ── */}
      <section className="bg-surface border-b border-border px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <SearchFilterBar />
        </div>
      </section>

      {/* ── Stats Bar (web-only enhancement) ── */}
      <section className="bg-card border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { value: "500+", label: "Active Listings" },
            { value: "120+", label: "Verified Dealers" },
            { value: "14",   label: "Districts Covered" },
            { value: "2,000+", label: "Happy Buyers" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-xl font-bold text-brand-accent">{s.value}</p>
              <p className="text-text-muted text-xs mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Cars For Sale — mirrors ListingCarousel type="cars" ── */}
      <section className="max-w-6xl mx-auto px-4 py-14">
        <SectionHeader title="Cars For Sale" href="/cars" linkLabel="View all cars" />
        {cars.length === 0 ? (
          <EmptySlot label="No car listings yet — check back soon." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((c) => (
              <ListingCard key={c.id} listing={c} href={`/cars/${c.id}`} fallbackIcon={Car} />
            ))}
          </div>
        )}
      </section>

      {/* ── 4. Land For Sale — mirrors ListingCarousel type="land" ── */}
      <section className="max-w-6xl mx-auto px-4 pb-14">
        <SectionHeader title="Land For Sale" href="/land" linkLabel="View all land" />
        {land.length === 0 ? (
          <EmptySlot label="No land listings yet — check back soon." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {land.map((p) => (
              <ListingCard key={p.id} listing={p} href={`/land/${p.id}`} fallbackIcon={LandPlot} />
            ))}
          </div>
        )}
      </section>

      {/* ── 5. Vendors on JeffLink — mirrors ListingCarousel type="vendors" ── */}
      {vendors.length > 0 && (
        <section className="bg-card border-y border-border py-14 px-4">
          <div className="max-w-6xl mx-auto">
            <SectionHeader title="Vendors on JeffLink" href="/vendors" linkLabel="View all vendors" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vendors.map((v) => (
                <Link
                  key={v.id}
                  href={`/vendors/${v.id}`}
                  className="bg-card border border-border rounded-card p-5 flex flex-col items-center text-center gap-3 hover:border-brand-primary/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xl border border-border overflow-hidden">
                    {v.avatarUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={v.avatarUrl} alt={v.businessName} className="w-full h-full object-cover" />
                      : v.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-text font-semibold text-sm line-clamp-1">{v.businessName}</p>
                    <p className="text-text-muted text-xs mt-0.5">{v.city} · {v.listingCount} listings</p>
                  </div>
                  {v.isVerified && (
                    <span className="text-xs bg-brand-primary/20 text-brand-accent px-2 py-0.5 rounded-full font-medium">
                      ✓ Verified
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. Featured Listings — mirrors FeaturedListingsCarousel ── */}
      {featured.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-14">
          <SectionHeader title="Featured Listings" href="/search?sort=featured" linkLabel="View all featured" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featured.map((f) => (
              <FeaturedListingCard key={f.id} listing={f} />
            ))}
          </div>
        </section>
      )}

      {/* ── How It Works (web-only enhancement) ── */}
      <section className="bg-surface border-t border-border py-14 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-semibold text-text mb-10 text-center">How JeffLink Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Search & Filter", desc: "Browse listings by category, location, and price range across Uganda.", Icon: Search },
              { step: "02", title: "Contact Directly", desc: "Message verified sellers and dealers without any middlemen or fees.", Icon: MessageCircle },
              { step: "03", title: "Close the Deal", desc: "Meet up, inspect, and seal your deal safely with our verified sellers.", Icon: Handshake },
            ].map((item) => (
              <div key={item.step} className="flex flex-col items-center text-center gap-3">
                <item.Icon size={40} strokeWidth={1.5} className="text-brand-accent" />
                <span className="text-brand-accent text-xs font-bold tracking-widest">STEP {item.step}</span>
                <h3 className="text-text font-semibold text-lg">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Post Listing CTA ── */}
      <section className="bg-brand-primary/10 border-t border-brand-primary/20 py-14 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-text mb-3">
            Have Something to Sell?
          </h2>
          <p className="text-text-muted mb-6">
            Post your car, land, or property for free and reach thousands of buyers across Uganda.
          </p>
          <Link
            href="/sell"
            className="inline-block bg-brand-primary text-brand-white font-semibold px-8 py-3 rounded-button hover:bg-brand-primary/90 transition-colors"
          >
            Post a Free Listing
          </Link>
          <Link
            href="/hire-purchase"
            className="ml-3 inline-block bg-brand-accent text-black font-bold px-8 py-3 rounded-button hover:bg-brand-accent/90 transition-colors"
          >
            Start Hire Purchase
          </Link>
        </div>
      </section>

    </main>
  );
}

// ── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="flex items-center justify-between mb-7">
      <h2 className="text-2xl font-semibold text-text">{title}</h2>
      <Link href={href} className="text-brand-accent text-sm font-medium hover:underline">
        {linkLabel} →
      </Link>
    </div>
  );
}

function EmptySlot({ label }: { label: string }) {
  return <p className="text-text-muted text-center py-16">{label}</p>;
}

function ListingCard({ listing, href, fallbackIcon: FallbackIcon }: { listing: ListingSummary; href: string; fallbackIcon: LucideIcon }) {
  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group"
    >
      <div className="aspect-[4/3] bg-card relative overflow-hidden">
        {listing.coverUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={listing.coverUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-text-muted"><FallbackIcon size={48} strokeWidth={1.5} /></div>
        }
      </div>
      <div className="p-4">
        <h3 className="text-text font-semibold text-sm line-clamp-1 mb-1">{listing.title}</h3>
        <p className="text-text-muted text-xs mb-2">{listing.location}</p>
        <p className="text-brand-accent font-bold text-sm">{listing.price}</p>
      </div>
    </Link>
  );
}

/** Mirrors FeedListingCard used inside FeaturedListingsCarousel — full-width card with type badge */
function FeaturedListingCard({ listing }: { listing: ListingSummary }) {
  const href = listing.type === "vehicle" ? `/cars/${listing.id}` : `/land/${listing.id}`;
  const badge = listing.type === "vehicle" ? "Car" : "Property";
  const FallbackIcon = listing.type === "vehicle" ? Car : LandPlot;

  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group relative"
    >
      <div className="aspect-[4/3] bg-surface relative overflow-hidden">
        {listing.coverUrl
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={listing.coverUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center text-text-muted"><FallbackIcon size={48} strokeWidth={1.5} /></div>
        }
        {/* Type badge — matches mobile FeedListingCard badge */}
        <span className="absolute top-2 left-2 bg-brand-primary/90 text-brand-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
        {/* Featured badge */}
        <span className="absolute top-2 right-2 bg-brand-warning/90 text-brand-black text-[10px] font-bold px-2 py-0.5 rounded-full">
          ★ Featured
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-text font-semibold text-sm line-clamp-1 mb-1">{listing.title}</h3>
        <p className="text-text-muted text-xs mb-2">{listing.location}</p>
        <p className="text-brand-accent font-bold text-sm">{listing.price}</p>
      </div>
    </Link>
  );
}



