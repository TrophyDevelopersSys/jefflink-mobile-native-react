export type SearchScope = "cars" | "land" | "houses" | "vendors" | "ads";

export type PropertyType = "cars" | "land" | "houses" | "commercial" | "land-lease";
export type SellerType = "all" | "verified" | "vendor" | "private";
export type Location =
  | "kampala" | "mukono" | "wakiso" | "entebbe" | "jinja"
  | "mbarara" | "gulu" | "mbale" | "masaka";

export type PriceRange = {
  label: string;
  min?: number;
  max?: number;
};

export const PRICE_RANGES: Record<PropertyType, PriceRange[]> = {
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

export type SearchFilters = {
  propertyType: PropertyType | null;
  seller: SellerType;
  priceRange: PriceRange | null;
  location: Location | null;
  query: string;
};

export const DEFAULT_FILTERS: SearchFilters = {
  propertyType: null,
  seller: "all",
  priceRange: null,
  location: null,
  query: "",
};

/** Build the API query string from filters */
export function buildSearchQuery(filters: SearchFilters): string {
  const params = new URLSearchParams();
  if (filters.propertyType) params.set("type", filters.propertyType);
  if (filters.seller !== "all") params.set("seller", filters.seller);
  if (filters.location) params.set("location", filters.location);
  if (filters.priceRange?.min != null) params.set("priceMin", String(filters.priceRange.min));
  if (filters.priceRange?.max != null) params.set("priceMax", String(filters.priceRange.max));
  if (filters.query.trim()) params.set("q", filters.query.trim());
  return params.toString();
}

export type SearchResult = {
  id: string;
  scope: SearchScope;
  title: string;
  subtitle: string;
};

export type SearchParams = {
  query: string;
  scopes: SearchScope[];
  limit?: number;
  offset?: number;
};

const searchIndex: SearchResult[] = [
  { id: "car-1", scope: "cars", title: "Toyota Prado", subtitle: "Kampala" },
  {
    id: "land-1",
    scope: "land",
    title: "Mbarara 50x100 Plot",
    subtitle: "Mbarara"
  },
  {
    id: "house-1",
    scope: "houses",
    title: "4BR House in Entebbe",
    subtitle: "Entebbe"
  },
  {
    id: "vendor-1",
    scope: "vendors",
    title: "Kampala Auto Hub",
    subtitle: "Verified Dealer"
  },
  {
    id: "ad-1",
    scope: "ads",
    title: "Finance in 48 Hours",
    subtitle: "JeffLink Finance"
  }
];

export async function searchMarketplace({
  query,
  scopes,
  limit = 10,
  offset = 0
}: SearchParams): Promise<SearchResult[]> {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  const filtered = searchIndex.filter((item) => {
    const inScope = scopes.includes(item.scope);
    const matchesQuery =
      item.title.toLowerCase().includes(normalizedQuery) ||
      item.subtitle.toLowerCase().includes(normalizedQuery);

    return inScope && matchesQuery;
  });

  return filtered.slice(offset, offset + limit);
}
