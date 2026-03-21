import { useCallback, useEffect, useState } from "react";
import { cmsApi } from "../../api/cms.api";
import type { CmsPage, CmsNavigation, CmsSettings, CmsPlatform } from "@jefflink/types";

export function useCmsHomepage() {
  const [data, setData] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await cmsApi.getHomepage();
      setData(page);
    } catch {
      setError("Failed to load homepage content");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return { data, loading, error, reload: load };
}

export function useCmsPage(slug: string, platform?: CmsPlatform) {
  const [data, setData] = useState<CmsPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    cmsApi.getPage(slug, platform)
      .then((page) => { if (!cancelled) setData(page); })
      .catch(() => { if (!cancelled) setError("Failed to load page"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug, platform]);

  return { data, loading, error };
}

export function useCmsNavigation(key: string, platform?: CmsPlatform) {
  const [data, setData] = useState<CmsNavigation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cmsApi.getNavigation(key, platform)
      .then((nav) => { if (!cancelled) setData(nav); })
      .catch(() => { if (!cancelled) setError("Failed to load navigation"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [key, platform]);

  return { data, loading, error };
}

export function useCmsSettings() {
  const [data, setData] = useState<CmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    cmsApi.getSettings()
      .then((s) => { if (!cancelled) setData(s); })
      .catch(() => { if (!cancelled) setError("Failed to load settings"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return { data, loading, error };
}
