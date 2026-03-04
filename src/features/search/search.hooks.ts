import { useEffect, useMemo, useState } from "react";

import {
  type SearchResult,
  type SearchScope,
  searchMarketplace
} from "./search.service";

const defaultScopes: SearchScope[] = ["cars", "land", "houses", "vendors", "ads"];

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
    results
  };
}
