import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ListingDetail, ListingSummary, VendorProfile } from "@jefflink/types";
import ListingDetailLayout from "../../../src/components/listing/ListingDetailLayout";

const API = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1";

async function getHouse(id: string): Promise<ListingDetail | null> {
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
    const res = await fetch(`${API}/listings?type=property&subtype=house&limit=5`, { next: { revalidate: 60 } });
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
  const house = await getHouse(id);
  if (!house) return { title: "House Not Found" };
  return {
    title: `${house.title} | JeffLink`,
    description: house.description ?? `${house.title} for sale in ${house.location}. Price: ${house.price}`,
    openGraph: { title: `${house.title} | JeffLink`, images: house.coverUrl ? [house.coverUrl] : [] },
  };
}

export default async function HouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const house = await getHouse(id);
  if (!house) notFound();

  const [vendor, related] = await Promise.all([
    house.vendorId ? getVendor(house.vendorId) : Promise.resolve(null),
    getRelated(id),
  ]);

  return (
    <ListingDetailLayout
      listing={house}
      vendor={vendor}
      related={related}
      category="houses"
      categoryLabel="Houses"
      fallbackIcon="🏠"
      contactLabel="Contact Seller"
      typeBadge="House"
    />
  );
}
