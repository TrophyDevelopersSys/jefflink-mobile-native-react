"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// ─── Shared filter constants (mirrors mobile search.service.ts) ──────────────

type PropertyType = "cars" | "land" | "houses" | "commercial" | "land-lease";
type SellerType = "all" | "verified" | "vendor" | "private";
type Location =
  | "kampala" | "mukono" | "wakiso" | "entebbe" | "jinja"
  | "mbarara" | "gulu" | "mbale" | "masaka";

type PriceRange = { label: string; min?: number; max?: number };

const PROPERTY_TYPES: { label: string; value: PropertyType }[] = [
  { label: "Cars", value: "cars" },
  { label: "Land", value: "land" },
  { label: "Houses", value: "houses" },
  { label: "Commercial Property", value: "commercial" },
  { label: "Land for Lease", value: "land-lease" },
];

const SELLER_TYPES: { label: string; value: SellerType }[] = [
  { label: "All Listings", value: "all" },
  { label: "JeffLink Verified ✓", value: "verified" },
  { label: "Vendor / Dealer", value: "vendor" },
  { label: "Private Seller", value: "private" },
];

const PRICE_RANGES: Record<PropertyType, PriceRange[]> = {
  cars: [
    { label: "Any Price" },
    { label: "Under 20M", max: 20_000_000 },
    { label: "20M – 50M", min: 20_000_000, max: 50_000_000 },
    { label: "50M – 100M", min: 50_000_000, max: 100_000_000 },
    { label: "100M+", min: 100_000_000 },
  ],
  land: [
    { label: "Any Price" },
    { label: "Under 5M", max: 5_000_000 },
    { label: "5M – 20M", min: 5_000_000, max: 20_000_000 },
    { label: "20M – 100M", min: 20_000_000, max: 100_000_000 },
    { label: "100M+", min: 100_000_000 },
  ],
  houses: [
    { label: "Any Price" },
    { label: "Under 50M", max: 50_000_000 },
    { label: "50M – 150M", min: 50_000_000, max: 150_000_000 },
    { label: "150M – 500M", min: 150_000_000, max: 500_000_000 },
    { label: "500M+", min: 500_000_000 },
  ],
  commercial: [
    { label: "Any Price" },
    { label: "Under 100M", max: 100_000_000 },
    { label: "100M – 500M", min: 100_000_000, max: 500_000_000 },
    { label: "500M+", min: 500_000_000 },
  ],
  "land-lease": [
    { label: "Any Price" },
    { label: "Under 1M/yr", max: 1_000_000 },
    { label: "1M – 5M/yr", min: 1_000_000, max: 5_000_000 },
    { label: "5M+/yr", min: 5_000_000 },
  ],
};

const LOCATIONS: { label: string; value: Location }[] = [
  { label: "Kampala", value: "kampala" },
  { label: "Mukono", value: "mukono" },
  { label: "Wakiso", value: "wakiso" },
  { label: "Entebbe", value: "entebbe" },
  { label: "Jinja", value: "jinja" },
  { label: "Mbarara", value: "mbarara" },
  { label: "Gulu", value: "gulu" },
  { label: "Mbale", value: "mbale" },
  { label: "Masaka", value: "masaka" },
];

// ─── FilterSelect ─────────────────────────────────────────────────────────────

function FilterSelect({
  id,
  placeholder,
  options,
  value,
  onChange,
}: {
  id: string;
  placeholder: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-full bg-transparent text-text text-sm font-medium appearance-none cursor-pointer focus:outline-none"
      aria-label={placeholder}
    >
      <option value="" className="bg-card text-text-muted">
        {placeholder}
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-card text-text">
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ─── SearchFilterBar ──────────────────────────────────────────────────────────

export default function SearchFilterBar() {
  const router = useRouter();
  const [propertyType, setPropertyType] = useState<PropertyType | "">("");
  const [seller, setSeller] = useState<SellerType | "">("");
  const [priceKey, setPriceKey] = useState("");
  const [location, setLocation] = useState<Location | "">("");

  const activePriceType: PropertyType = (propertyType as PropertyType) || "cars";
  const priceRanges = PRICE_RANGES[activePriceType];

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const base = propertyType
      ? `/${propertyType === "land-lease" ? "land" : propertyType}`
      : "/cars";
    const params = new URLSearchParams();
    if (seller && seller !== "all") params.set("seller", seller);
    if (location) params.set("location", location);
    const priceRange = priceRanges.find((r) => r.label === priceKey);
    if (priceRange?.min != null) params.set("priceMin", String(priceRange.min));
    if (priceRange?.max != null) params.set("priceMax", String(priceRange.max));
    const qs = params.toString();
    router.push(`${base}${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={handleSearch}
      className="w-full max-w-5xl mx-auto"
      role="search"
      aria-label="Search marketplace listings"
    >
      {/* Desktop: 5-column grid */}
      <div className="hidden md:grid md:grid-cols-5 gap-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-3 shadow-xl">
        {/* Property Type */}
        <div className="relative flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="prop-type"
            placeholder="Property Type ▼"
            options={PROPERTY_TYPES}
            value={propertyType}
            onChange={(v) => {
              setPropertyType(v as PropertyType | "");
              setPriceKey(""); // reset price on type change
            }}
          />
        </div>

        {/* Seller */}
        <div className="relative flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="seller"
            placeholder="Seller ▼"
            options={SELLER_TYPES}
            value={seller}
            onChange={(v) => setSeller(v as SellerType | "")}
          />
        </div>

        {/* Price */}
        <div className="relative flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="price"
            placeholder="Price ▼"
            options={priceRanges.map((r) => ({ label: r.label, value: r.label }))}
            value={priceKey}
            onChange={setPriceKey}
          />
        </div>

        {/* Location */}
        <div className="relative flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="location"
            placeholder="Location ▼"
            options={LOCATIONS}
            value={location}
            onChange={(v) => setLocation(v as Location | "")}
          />
        </div>

        {/* Search button */}
        <button
          type="submit"
          className="h-12 bg-brand-accent text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-colors text-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          Search
        </button>
      </div>

      {/* Mobile: stacked layout */}
      <div className="flex md:hidden flex-col gap-3 bg-card/80 backdrop-blur-sm border border-border rounded-xl p-4 shadow-xl">
        <div className="flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="prop-type-m"
            placeholder="Property Type ▼"
            options={PROPERTY_TYPES}
            value={propertyType}
            onChange={(v) => {
              setPropertyType(v as PropertyType | "");
              setPriceKey("");
            }}
          />
        </div>

        <div className="flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="seller-m"
            placeholder="Seller ▼"
            options={SELLER_TYPES}
            value={seller}
            onChange={(v) => setSeller(v as SellerType | "")}
          />
        </div>

        <div className="flex items-center bg-surface border border-border rounded-lg px-3 h-12">
          <FilterSelect
            id="location-m"
            placeholder="Location ▼"
            options={LOCATIONS}
            value={location}
            onChange={(v) => setLocation(v as Location | "")}
          />
        </div>

        <button
          type="submit"
          className="h-12 bg-brand-accent text-black font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z"
            />
          </svg>
          Search
        </button>
      </div>
    </form>
  );
}
