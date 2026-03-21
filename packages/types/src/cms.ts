// ── CMS Types ────────────────────────────────────────────────────────────────
// Shared across backend, web, and mobile.
// These types describe the Atlas CMS document shapes.

export type CmsPlatform = 'ALL' | 'MOBILE' | 'WEB';
export type CmsPageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

// ── Section types ────────────────────────────────────────────────────────────

export interface CmsSliderItem {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  buttonLabel?: string;
  buttonLink?: string;
  sortOrder: number;
}

export interface CmsBannerItem {
  id: string;
  imageUrl: string;
  link?: string;
  alt?: string;
}

export interface CmsContentBlock {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'html' | 'json' | 'url';
  description?: string;
}

export interface CmsListBlock {
  id: string;
  title: string;
  listingType?: string;
  query?: Record<string, unknown>;
  limit?: number;
}

// ── Page layout ──────────────────────────────────────────────────────────────

export interface CmsLayout {
  header?: CmsBannerItem[];
  slider?: CmsSliderItem[];
  body?: CmsContentBlock[];
  lists?: CmsListBlock[];
}

export interface CmsSeo {
  title?: string;
  description?: string;
  imageUrl?: string;
}

// ── Page document ────────────────────────────────────────────────────────────

export interface CmsPage {
  _id?: string;
  slug: string;
  platform: CmsPlatform;
  locale: string;
  title: string;
  status: CmsPageStatus;
  version: number;
  layout: CmsLayout;
  seo?: CmsSeo;
  publishedAt?: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface CmsPageRevision {
  _id?: string;
  pageId: string;
  slug: string;
  version: number;
  snapshot: CmsPage;
  createdAt: string;
  createdBy?: string;
}

// ── Navigation ───────────────────────────────────────────────────────────────

export interface CmsNavigationItem {
  label: string;
  href: string;
  icon?: string;
  children?: CmsNavigationItem[];
}

export interface CmsNavigation {
  _id?: string;
  key: string;
  platform: CmsPlatform;
  items: CmsNavigationItem[];
  status: CmsPageStatus;
  updatedAt: string;
  updatedBy?: string;
}

// ── Settings ─────────────────────────────────────────────────────────────────

export interface CmsSettings {
  _id?: string;
  appName: string;
  supportEmail: string;
  contactPhone: string;
  currencyDisplay: string;
  features: Record<string, boolean>;
  updatedAt: string;
  updatedBy?: string;
}
