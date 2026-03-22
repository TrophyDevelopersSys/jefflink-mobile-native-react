/**
 * Server-side CMS fetch helpers for Next.js server components.
 * Uses plain fetch (no auth) against the public CMS endpoints.
 */
import type { CmsPage } from "@jefflink/types";

const API =
  process.env["INTERNAL_API_URL"] ?? "https://api.jefflinkcars.com/api/v1";

export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  try {
    const res = await fetch(
      `${API}/cms/page/${encodeURIComponent(slug)}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const json = await res.json();
    return json.data ?? json ?? null;
  } catch {
    return null;
  }
}
