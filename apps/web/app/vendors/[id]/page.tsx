import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Store, MapPin, Phone, Mail } from "lucide-react";
import type { VendorProfile } from "@jefflink/types";

const API = process.env["INTERNAL_API_URL"] ?? "https://api.jefflinkcars.com/api/v1";

async function getVendor(id: string): Promise<VendorProfile | null> {
  try {
    const res = await fetch(`${API}/vendors/${id}`, {
      next: { revalidate: 0 },
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
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
  const vendor = await getVendor(id);
  if (!vendor) return { title: "Vendor Not Found" };
  return {
    title: vendor.businessName,
    description:
      vendor.description ??
      `${vendor.businessName} — verified dealer on JeffLink. Located in ${vendor.location}.`,
    openGraph: {
      images: vendor.logoUrl ? [vendor.logoUrl] : [],
    },
  };
}

export default async function VendorProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const vendor = await getVendor(id);
  if (!vendor) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          {" / "}
          <Link href="/vendors" className="hover:text-white">Vendors</Link>
          {" / "}
          <span className="text-white">{vendor.businessName}</span>
        </nav>

        {/* Vendor Header */}
        <div className="bg-card border border-border rounded-card p-6 flex items-start gap-6 mb-8">
          <div className="h-20 w-20 rounded-card bg-brand-slate flex items-center justify-center overflow-hidden flex-shrink-0">
            {vendor.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.logoUrl}
                alt={vendor.businessName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Store size={32} strokeWidth={1.5} className="text-brand-muted" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{vendor.businessName}</h1>
              {vendor.isVerified && (
                <span className="bg-brand-success/20 text-brand-success text-xs font-medium px-2 py-0.5 rounded-badge">
                  ✓ Verified
                </span>
              )}
            </div>
            <p className="text-text-muted text-sm mt-1 flex items-center gap-1.5">
              <MapPin size={14} strokeWidth={1.75} className="flex-shrink-0" />
              {vendor.location}
            </p>
            {vendor.description && (
              <p className="text-text-muted text-sm mt-3 leading-relaxed">
                {vendor.description}
              </p>
            )}

            <div className="flex gap-4 mt-4 flex-wrap">
              {vendor.phone && (
                <a
                  href={`tel:${vendor.phone}`}
                  className="text-brand-accent text-sm hover:underline flex items-center gap-1.5"
                >
                  <Phone size={14} strokeWidth={1.75} />
                  {vendor.phone}
                </a>
              )}
              {vendor.email && (
                <a
                  href={`mailto:${vendor.email}`}
                  className="text-brand-accent text-sm hover:underline flex items-center gap-1.5"
                >
                  <Mail size={14} strokeWidth={1.75} />
                  {vendor.email}
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
