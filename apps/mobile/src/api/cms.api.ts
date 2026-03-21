import { apiClient } from "./axios";
import { endpoints } from "../constants/endpoints";
import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsPlatform,
} from "@jefflink/types";

function unwrap<T>(res: { data: { data: T } | T }): T {
  const body = res.data;
  return (body as any)?.data ?? body;
}

export const cmsApi = {
  async getHomepage(): Promise<CmsPage | null> {
    const res = await apiClient.get(endpoints.cms.homepage);
    return unwrap(res);
  },

  async getPage(slug: string, platform?: CmsPlatform): Promise<CmsPage | null> {
    const res = await apiClient.get(endpoints.cms.page(slug), {
      params: { platform: platform ?? "MOBILE" },
    });
    return unwrap(res);
  },

  async getRevisions(pageId: string): Promise<CmsPageRevision[]> {
    const res = await apiClient.get(endpoints.cms.revisions(pageId));
    return unwrap(res) ?? [];
  },

  async getNavigation(key: string, platform?: CmsPlatform): Promise<CmsNavigation | null> {
    const res = await apiClient.get(endpoints.cms.navigation(key), {
      params: { platform: platform ?? "MOBILE" },
    });
    return unwrap(res);
  },

  async getSettings(): Promise<CmsSettings | null> {
    const res = await apiClient.get(endpoints.cms.settings);
    return unwrap(res);
  },
};
