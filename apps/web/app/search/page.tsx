import React, { Suspense } from "react";
import type { Metadata } from "next";
import SearchResults from "./SearchResults";

export const metadata: Metadata = {
  title: "Search Listings",
  description: "Search cars, land, houses, and commercial properties across Uganda on JeffLink.",
};

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-text-muted">Loading results…</p>
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
