"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Store, Car, LandPlot } from "lucide-react";
import type { ListingSummary } from "@jefflink/types";

const API = process.env["NEXT_PUBLIC_API_BASE_URL"] ?? "https://jefflink.onrender.com/api/v1";

type SortOption = "newest" | "price_asc" | "price_desc";

const CATEGORY_OPTIONS = [
  { label: "All Categories", value: "" },
  { label: "Cars", value: "vehicle" },
  { label: "Properties", value: "property" },
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
];

export default function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const q = searchParams.get("q") ?? "";
  const type = searchParams.get("type") ?? "";
  const location = searchParams.get("location") ?? "";
  const sort = (searchParams.get("sort") ?? "newest") as SortOption;

  const [query, setQuery] = useState(q);
  const [results, setResults] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchResults = useCallback(async () => {
    if (!q.trim() && !type && !location) {
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (type) params.set("type", type);
      if (location) params.set("location", location);
      params.set("limit", "24");

      const res = await fetch(`${API}/listings/search?${params.toString()}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json() as ListingSummary[] | { data: ListingSummary[]; total?: number };
      const items = Array.isArray(data) ? data : (data.data ?? []);
      const total = Array.isArray(data) ? items.length : (data.total ?? items.length);

      // Client-side sort
      let sorted = [...items];
      if (sort === "price_asc") {
        sorted.sort((a, b) => parseFloat(a.price.replace(/\D/g, "")) - parseFloat(b.price.replace(/\D/g, "")));
      } else if (sort === "price_desc") {
        sorted.sort((a, b) => parseFloat(b.price.replace(/\D/g, "")) - parseFloat(a.price.replace(/\D/g, "")));
      }

      setResults(sorted);
      setTotalCount(total);
    } catch {
      setError("Unable to load results. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [q, type, location, sort]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const pushSearch = (newParams: Record<string, string>) => {
    const p = new URLSearchParams(searchParams.toString());
    Object.entries(newParams).forEach(([k, v]) => {
      if (v) p.set(k, v);
      else p.delete(k);
    });
    router.push(`/search?${p.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    pushSearch({ q: query });
  };

  const listingHref = (listing: ListingSummary) => {
    if (listing.type === "vehicle") return `/cars/${listing.id}`;
    return `/land/${listing.id}`;
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Search header */}
      <section className="bg-brand-slate border-b border-border py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-xl font-bold text-white mb-4">Search Listings</h1>
          <form onSubmit={handleSearchSubmit} className="flex gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search cars, land, properties…"
              className="flex-1 bg-brand-night border border-border rounded-input px-4 py-3 text-white placeholder-brand-muted text-sm focus:outline-none focus:border-brand-primary/60"
            />
            <button
              type="submit"
              className="bg-brand-primary text-white font-semibold px-5 py-3 rounded-button hover:bg-brand-primary/90 transition-colors text-sm"
            >
              Search
            </button>
          </form>

          {/* Filter row */}
          <div className="flex flex-wrap gap-3 mt-4">
            <select
              value={type}
              onChange={(e) => pushSearch({ type: e.target.value })}
              className="bg-brand-night border border-border rounded-input px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/60"
              aria-label="Filter by category"
            >
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-brand-night">
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => pushSearch({ sort: e.target.value })}
              className="bg-brand-night border border-border rounded-input px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary/60"
              aria-label="Sort results"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-brand-night">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Stats row */}
        {(q || type) && !loading && (
          <p className="text-brand-muted text-sm mb-6">
            {error ? null : (
              <>
                {totalCount > 0
                  ? `${totalCount} result${totalCount !== 1 ? "s" : ""} found`
                  : "No results found"}
                {q ? ` for "${q}"` : ""}
                {type ? ` in ${CATEGORY_OPTIONS.find((o) => o.value === type)?.label ?? type}` : ""}
              </>
            )}
          </p>
        )}

        {/* States */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-card overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-brand-slate" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-brand-slate rounded w-3/4" />
                  <div className="h-3 bg-brand-slate rounded w-1/2" />
                  <div className="h-4 bg-brand-slate rounded w-1/3 mt-1" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-brand-danger mb-4">{error}</p>
            <button
              onClick={fetchResults}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-button text-sm hover:bg-brand-primary/90"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && results.length === 0 && (q || type) && (
          <div className="text-center py-24">
            <Search size={48} strokeWidth={1.5} className="text-brand-muted mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">No results found</p>
            <p className="text-brand-muted text-sm mb-6">
              Try adjusting your search term or removing filters.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/cars" className="bg-brand-slate border border-border text-white text-sm px-4 py-2 rounded-button hover:border-brand-primary/50">
                Browse Cars
              </Link>
              <Link href="/land" className="bg-brand-slate border border-border text-white text-sm px-4 py-2 rounded-button hover:border-brand-primary/50">
                Browse Land
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && !q && !type && (
          <div className="text-center py-24">
            <Store size={48} strokeWidth={1.5} className="text-brand-muted mx-auto mb-4" />
            <p className="text-white font-semibold text-lg mb-2">Start Searching</p>
            <p className="text-brand-muted text-sm">Enter a keyword above to find listings.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((listing) => (
              <Link
                key={listing.id}
                href={listingHref(listing)}
                className="bg-card border border-border rounded-card overflow-hidden hover:border-brand-primary/50 transition-colors group"
              >
                <div className="aspect-[4/3] bg-brand-slate relative overflow-hidden">
                  {listing.coverUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={listing.coverUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-brand-muted">
                      {listing.type === "vehicle" ? <Car size={48} strokeWidth={1.5} /> : <LandPlot size={48} strokeWidth={1.5} />}
                    </div>
                  )}
                  <span className="absolute top-2 left-2 text-xs font-medium bg-brand-night/80 text-brand-muted px-2 py-0.5 rounded-badge capitalize">
                    {listing.type}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm line-clamp-1 mb-1">{listing.title}</h3>
                  <p className="text-brand-muted text-xs mb-2">{listing.location}</p>
                  <p className="text-brand-accent font-bold text-sm">{listing.price}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
