import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsPlatform,
  CmsPageStatus,
} from './cms.types';

/** Query filters shared by both stores */
export interface CmsPageQuery {
  slug?: string;
  platform?: CmsPlatform;
  locale?: string;
  status?: CmsPageStatus;
  preview?: boolean;
}

/** Abstract store contract – implemented by Neon and Atlas stores */
export interface CmsStore {
  // ── Pages ────────────────────────────────────────────────────────────────
  findPage(query: CmsPageQuery): Promise<CmsPage | null>;
  findPages(query: CmsPageQuery): Promise<CmsPage[]>;
  createPage(page: Omit<CmsPage, '_id' | 'version' | 'updatedAt'>): Promise<CmsPage>;
  updatePage(id: string, patch: Partial<CmsPage>, expectedVersion?: number): Promise<CmsPage>;
  publishPage(id: string, status: 'PUBLISHED' | 'ARCHIVED', updatedBy?: string): Promise<CmsPage>;
  deletePage(id: string): Promise<void>;

  // ── Revisions ────────────────────────────────────────────────────────────
  findRevisions(pageId: string): Promise<CmsPageRevision[]>;

  // ── Navigation ───────────────────────────────────────────────────────────
  findNavigation(key: string, platform: CmsPlatform): Promise<CmsNavigation | null>;
  upsertNavigation(nav: Omit<CmsNavigation, '_id' | 'updatedAt'>): Promise<CmsNavigation>;

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings(): Promise<CmsSettings | null>;
  updateSettings(patch: Partial<CmsSettings>): Promise<CmsSettings>;

  // ── Homepage (legacy compat) ─────────────────────────────────────────────
  getHomepage(): Promise<{ heroSliders: unknown[]; heroBanners: unknown[]; content: Record<string, string> }>;
}
