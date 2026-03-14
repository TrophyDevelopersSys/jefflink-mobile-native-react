import Link from "next/link";
import { Metadata } from "next";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Verified Vendors",
  description:
    "Browse trusted and verified car dealers, property agents, and service vendors on JeffLink.",
};

export const revalidate = 60;

interface VendorSummary {
  id: string;
  businessName: string;
  category: string;
  city: string;
  isVerified: boolean;
  listingCount: number;
  avatarUrl?: string;
}

async function fetchVendors(): Promise<VendorSummary[]> {
  try {
    const res = await fetch(
      `${process.env["INTERNAL_API_URL"] ?? "https://jefflink.onrender.com/api/v1"}/vendors?limit=24`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? json ?? [];
  } catch {
    return [];
  }
}

export default async function VendorsPage() {
  const vendors = await fetchVendors();

  return (
    <main className="min-h-screen bg-background text-text">
      {/* Header */}
      <section className="bg-surface border-b border-border py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-brand-primary mb-2">
            Verified Vendors
          </h1>
          <p className="text-text-muted text-lg">
            Connect with trusted Verified Sellers, agents, and service providers
            verified by JeffLink.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        {vendors.length === 0 ? (
          <p className="text-text-muted text-center py-20">
            No vendors listed yet — check back soon.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vendors.map((vendor) => (
              <Link
                key={vendor.id}
                href={`/vendors/${vendor.id}`}
                className="group block bg-card rounded-card border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  {vendor.avatarUrl ? (
                    <img
                      src={vendor.avatarUrl}
                      alt={vendor.businessName}
                      className="w-14 h-14 rounded-full object-cover border border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary font-bold text-xl">
                      {vendor.businessName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-text truncate group-hover:text-brand-primary transition-colors">
                        {vendor.businessName}
                      </h2>
                      {vendor.isVerified && (
                        <span className="shrink-0 text-xs bg-brand-accent/10 text-brand-accent font-medium px-2 py-0.5 rounded-badge border border-brand-accent/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted mt-0.5">
                      {vendor.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-text-muted">
                  <span className="flex items-center gap-1 text-brand-muted text-xs">
                    <MapPin size={12} strokeWidth={1.75} />
                    {vendor.city}
                  </span>
                  <span>{vendor.listingCount} listing{vendor.listingCount !== 1 ? "s" : ""}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
