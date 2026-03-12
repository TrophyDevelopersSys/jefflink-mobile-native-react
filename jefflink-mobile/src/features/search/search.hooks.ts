import { useEffect, useMemo, useState } from "react";

import {
  type SearchFilters,
  type SearchResult,
  type SearchScope,
  DEFAULT_FILTERS,
  buildSearchQuery,
  searchMarketplace,
} from "./search.service";

const defaultScopes: SearchScope[] = ["cars", "land", "houses", "vendors", "ads"];

export function useSearchFilters() {
  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_FILTERS);

  function setFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      // Reset price range when property type changes
      if (key === "propertyType") next.priceRange = null;
      return next;
    });
  }

  function resetFilters() {
    setFilters(DEFAULT_FILTERS);
  }

  const queryString = useMemo(() => buildSearchQuery(filters), [filters]);

  return { filters, setFilter, resetFilters, queryString };
}

export function useGlobalSearch(scopes: SearchScope[] = defaultScopes) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);

  const stableScopes = useMemo(() => scopes, [scopes]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await searchMarketplace({ query, scopes: stableScopes });
        setResults(response);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, stableScopes]);

  return {
    query,
    setQuery,
    loading,
    results,
  };
}
