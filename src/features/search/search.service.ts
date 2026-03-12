export type SearchScope = "cars" | "land" | "houses" | "vendors" | "ads";

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
