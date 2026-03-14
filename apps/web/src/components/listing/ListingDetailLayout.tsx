import React from "react";
import Link from "next/link";
import type { ListingDetail, ListingSummary, VendorProfile } from "@jefflink/types";
import ActionBar from "./ActionBar";

// ── Label helpers ────────────────────────────────────────────────────────────

/** Humanise an attribute key: "fuelType" → "Fuel Type" */
function humanise(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/^./, (c) => c.toUpperCase())
    .trim();
}

/** Pick a few attributes to show as quick badge pills (up to 5) */
const META_KEYS = new Set([
  "condition", "fuel", "fuelType", "transmission", "gps",
  "hirePurchase", "hire_purchase", "verified", "titleType", "titletype",
]);

// ── Sub-components ────────────────────────────────────────────────────────────

function MetaBadge({ label }: { label: string }) {
  return (
    <span className="text-xs bg-brand-slate border border-border text-brand-muted px-3 py-1 rounded-full capitalize whitespace-nowrap">
      {label}
    </span>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-brand-slate rounded-lg p-3.5 border border-border">
      <p className="text-brand-muted text-[11px] uppercase tracking-wide mb-0.5">{label}</p>
      <p className="text-brand-white text-sm font-semibold">{value}</p>
    </div>
  );
}

function RelatedCard({ listing, href }: { listing: ListingSummary; href: string }) {
  return (
    <Link
      href={href}
      className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group"
    >
      <div className="aspect-[4/3] bg-brand-slate overflow-hidden">
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl">
            {listing.type === "vehicle" ? "🚗" : "🏘️"}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-brand-white text-xs font-semibold line-clamp-1 mb-0.5">{listing.title}</p>
        <p className="text-brand-muted text-[11px] mb-1">{listing.location}</p>
        <p className="text-brand-accent text-xs font-bold">{listing.price}</p>
      </div>
    </Link>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ListingDetailLayoutProps {
  listing: ListingDetail;
  vendor?: VendorProfile | null;
  related: ListingSummary[];
  /** e.g. "cars" — used for breadcrumb href */
  category: string;
  /** e.g. "Cars" — used for breadcrumb label */
  categoryLabel: string;
  /** Fallback emoji when no coverUrl */
  fallbackIcon: string;
  /** CTA label e.g. "Contact Dealer" */
  contactLabel: string;
  /** Type badge label e.g. "Car" */
  typeBadge: string;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ListingDetailLayout({
  listing,
  vendor,
  related,
  category,
  categoryLabel,
  fallbackIcon,
  contactLabel,
  typeBadge,
}: ListingDetailLayoutProps) {
  const attrs = listing.attributes ?? {};
  const attrEntries = Object.entries(attrs);

  // Quick meta badges — pick recognisable keys or fall back to first 5
  const metaBadgeEntries = attrEntries.filter(([k]) => META_KEYS.has(k));
  const metaBadges: string[] = metaBadgeEntries.length > 0
    ? metaBadgeEntries.slice(0, 5).map(([, v]) => String(v))
    : attrEntries.slice(0, 3).map(([, v]) => String(v));

  // Parse createdAt for display
  const postedDate = listing.createdAt
    ? new Date(listing.createdAt).toLocaleDateString("en-UG", {
        day: "numeric", month: "short", year: "numeric",
      })
    : null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* ── Breadcrumb ── */}
        <nav className="text-sm text-brand-muted mb-6 flex flex-wrap items-center gap-1.5">
          <Link href="/" className="hover:text-brand-white transition-colors">Home</Link>
          <span>/</span>
          <Link href={`/${category}`} className="hover:text-brand-white transition-colors capitalize">
            {categoryLabel}
          </Link>
          <span>/</span>
          <span className="text-brand-white line-clamp-1">{listing.title}</span>
        </nav>

        {/* ── Two-column grid (stacks on mobile) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          {/* ── Left col: image + description + specs ── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* Hero image */}
            <div className="aspect-[16/9] bg-brand-slate rounded-card overflow-hidden relative">
              {listing.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={listing.coverUrl}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-brand-muted">
                  <span className="text-7xl">{fallbackIcon}</span>
                  <span className="text-xs">No photos available</span>
                </div>
              )}
              {/* Overlay: listing-type pill */}
              <span className="absolute top-3 left-3 bg-brand-primary/90 text-brand-white text-xs font-bold px-2.5 py-1 rounded-full">
                {typeBadge}
              </span>
            </div>

            {/* About this listing */}
            {listing.description && (
              <section className="bg-card border border-border rounded-card p-6">
                <h2 className="text-brand-white font-bold text-base mb-3">About This Listing</h2>
                <p className="text-brand-muted text-sm leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </section>
            )}

            {/* Key specifications — mirrors mobile ListingSpec grid */}
            {attrEntries.length > 0 && (
              <section className="bg-card border border-border rounded-card p-6">
                <h2 className="text-brand-white font-semibold text-base mb-4">Key Specifications</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {attrEntries.map(([key, value]) => (
                    <SpecRow key={key} label={humanise(key)} value={String(value)} />
                  ))}
                </div>
              </section>
            )}

            {/* Related listings */}
            {related.length > 0 && (
              <section>
                <h2 className="text-brand-white font-semibold text-base mb-4">Similar Listings</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {related.map((r) => {
                    const rHref = r.type === "vehicle" ? `/cars/${r.id}` : `/${category}/${r.id}`;
                    return <RelatedCard key={r.id} listing={r} href={rHref} />;
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ── Right col: sticky sidebar ── */}
          <div className="lg:sticky lg:top-24 flex flex-col gap-4">

            {/* Price card */}
            <div className="bg-card border border-border rounded-card p-5 flex flex-col gap-4">

              {/* Type badge */}
              <span className="self-start text-xs bg-brand-primary/20 text-brand-accent px-2.5 py-1 rounded-full font-semibold">
                {typeBadge}
              </span>

              {/* Title */}
              <h1 className="text-brand-white font-bold text-xl leading-snug">{listing.title}</h1>

              {/* Price — mirrors mobile ListingPrice */}
              <p className="text-brand-accent font-extrabold text-3xl">{listing.price}</p>

              {/* Location — mirrors mobile ListingHeader subtitle */}
              <div className="flex items-center gap-2 text-brand-muted text-sm">
                <span>📍</span>
                <span>{listing.location}</span>
              </div>

              {/* Meta badges — mirrors mobile ListingMeta pills */}
              {metaBadges.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {metaBadges.map((b, i) => <MetaBadge key={i} label={b} />)}
                </div>
              )}

              {postedDate && (
                <p className="text-brand-muted text-xs">Posted {postedDate}</p>
              )}
            </div>

            {/* Vendor card */}
            {vendor && (
              <div className="bg-card border border-border rounded-card p-5 flex flex-col gap-3">
                <p className="text-brand-muted text-xs uppercase tracking-wide font-semibold">Seller</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-border flex items-center justify-center font-bold text-brand-primary text-sm flex-shrink-0 overflow-hidden">
                    {vendor.logoUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={vendor.logoUrl} alt={vendor.businessName} className="w-full h-full object-cover" />
                      : vendor.businessName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-brand-white font-semibold text-sm line-clamp-1">{vendor.businessName}</p>
                    <p className="text-brand-muted text-xs">{vendor.location}</p>
                  </div>
                </div>
                {vendor.isVerified && (
                  <span className="self-start text-xs bg-brand-primary/20 text-brand-accent px-2 py-0.5 rounded-full font-medium">
                    ✓ Verified Dealer
                  </span>
                )}
                <Link
                  href={`/vendors/${vendor.id}`}
                  className="text-brand-accent text-xs font-medium hover:underline"
                >
                  View all listings by this seller →
                </Link>
              </div>
            )}

            {/* Action bar — client component */}
            <ActionBar
              listingId={listing.id}
              contactLabel={contactLabel}
              vendorPhone={vendor?.phone}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
