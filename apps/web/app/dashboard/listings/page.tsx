import type { Metadata } from "next";
import ListingsClient from "./ListingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Listings",
  description: "Manage your JeffLink listings, performance, and publishing actions.",
  robots: { index: false, follow: false },
};

export default function DashboardListingsPage() {
  return <ListingsClient />;
}
