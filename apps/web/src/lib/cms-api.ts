/**
 * CMS Admin API client for the Next.js admin panel.
 * All requests go to /api/v1/admin/cms/* authenticated via the stored JWT.
 */
import axios from "axios";
import { webAuthAdapter } from "./authAdapter";
import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsLayout,
  CmsSeo,
  CmsPlatform,
  CmsPageStatus,
} from "@jefflink/types";

const BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.jefflinkcars.com/api/v1";

const cmsHttp = axios.create({ baseURL: BASE });

cmsHttp.interceptors.request.use(async (config) => {
  const token = await webAuthAdapter.getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function unwrap<T>(res: { data: { data: T } | T }): T {
  const body = res.data;
  return (body as any)?.data ?? body;
}

// ── Public reads (used for preview) ───────────────────────────────────────────

export async function getCmsHomepage(): Promise<CmsPage | null> {
  const res = await cmsHttp.get("/cms/homepage");
  return unwrap(res);
}

export async function getCmsPage(
  slug: string,
  opts?: { platform?: CmsPlatform; preview?: boolean },
): Promise<CmsPage | null> {
  const res = await cmsHttp.get(`/cms/page/${encodeURIComponent(slug)}`, {
    params: opts,
  });
  return unwrap(res);
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export async function listCmsPages(
  platform?: CmsPlatform,
  locale?: string,
): Promise<CmsPage[]> {
  const res = await cmsHttp.get("/admin/cms/pages", {
    params: { platform, locale },
  });
  return unwrap(res) ?? [];
}

export async function createCmsPage(body: {
  slug: string;
  title: string;
  platform: CmsPlatform;
  locale?: string;
  layout: CmsLayout;
  seo?: CmsSeo;
  status?: CmsPageStatus;
}): Promise<CmsPage> {
  const res = await cmsHttp.post("/admin/cms/pages", body);
  return unwrap(res);
}

export async function updateCmsPage(
  id: string,
  body: {
    title?: string;
    platform?: CmsPlatform;
    locale?: string;
    layout?: CmsLayout;
    seo?: CmsSeo;
    expectedVersion?: number;
  },
): Promise<CmsPage> {
  const res = await cmsHttp.patch(`/admin/cms/pages/${id}`, body);
  return unwrap(res);
}

export async function publishCmsPage(
  id: string,
  status: "PUBLISHED" | "ARCHIVED",
): Promise<CmsPage> {
  const res = await cmsHttp.post(`/admin/cms/pages/${id}/publish`, { status });
  return unwrap(res);
}

export async function deleteCmsPage(id: string): Promise<void> {
  await cmsHttp.delete(`/admin/cms/pages/${id}`);
}

export async function getCmsPageRevisions(
  id: string,
): Promise<CmsPageRevision[]> {
  const res = await cmsHttp.get(`/cms/page/${id}/revisions`);
  return unwrap(res) ?? [];
}

// ── Navigation ────────────────────────────────────────────────────────────────

export async function getCmsNavigation(
  key: string,
  platform?: CmsPlatform,
): Promise<CmsNavigation | null> {
  const res = await cmsHttp.get(`/cms/navigation/${encodeURIComponent(key)}`, {
    params: { platform },
  });
  return unwrap(res);
}

export async function upsertCmsNavigation(body: {
  key: string;
  platform: CmsPlatform;
  items: Array<{ label: string; href: string; icon?: string; children?: any[] }>;
}): Promise<CmsNavigation> {
  const res = await cmsHttp.put(
    `/admin/cms/navigation/${encodeURIComponent(body.key)}`,
    body,
  );
  return unwrap(res);
}

// ── Settings ──────────────────────────────────────────────────────────────────

export async function getCmsSettings(): Promise<CmsSettings | null> {
  const res = await cmsHttp.get("/cms/settings");
  return unwrap(res);
}

export async function updateCmsSettings(body: {
  appName?: string;
  supportEmail?: string;
  contactPhone?: string;
  currencyDisplay?: string;
  features?: Record<string, boolean>;
}): Promise<CmsSettings> {
  const res = await cmsHttp.put("/admin/cms/settings", body);
  return unwrap(res);
}
