import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BriefcaseBusiness } from "lucide-react";
import type { ListingDetail, ListingSummary, VendorProfile } from "@jefflink/types";
import ListingDetailLayout from "../../../src/components/listing/ListingDetailLayout";

const API = process.env["INTERNAL_API_URL"] ?? "https://jefflink.onrender.com/api/v1";

async function getCommercial(id: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API}/listings/${id}`, { next: { revalidate: 0 } });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch { return null; }
}

async function getVendor(vendorId: string): Promise<VendorProfile | null> {
  try {
    const res = await fetch(`${API}/vendors/${vendorId}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json;
  } catch { return null; }
}

async function getRelated(excludeId: string): Promise<ListingSummary[]> {
  try {
    const res = await fetch(`${API}/listings?type=property&subtype=commercial&limit=5`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json = await res.json();
    const items: ListingSummary[] = json.data ?? json ?? [];
    return items.filter((l) => l.id !== excludeId).slice(0, 4);
  } catch { return []; }
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
    description: listing.description ?? `${listing.title} in ${listing.location}. Price: ${listing.price}`,
    openGraph: { title: `${listing.title} | JeffLink`, images: listing.coverUrl ? [listing.coverUrl] : [] },
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

  const [vendor, related] = await Promise.all([
    listing.vendorId ? getVendor(listing.vendorId) : Promise.resolve(null),
    getRelated(id),
  ]);

  return (
    <ListingDetailLayout
      listing={listing}
      vendor={vendor}
      related={related}
      category="commercial"
      categoryLabel="Commercial"
      fallbackIcon={BriefcaseBusiness}
      contactLabel="Contact Vendor"
      typeBadge="Commercial"
    />
  );
}
