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

// ── Extended component types ─────────────────────────────────────────────────

export interface CmsHeroBlock {
  id: string;
  heading: string;
  subheading?: string;
  backgroundImageUrl?: string;
  ctaLabel?: string;
  ctaLink?: string;
  alignment?: 'left' | 'center' | 'right';
}

export interface CmsTextBlock {
  id: string;
  content: string;
  format: 'plain' | 'html' | 'markdown';
}

export interface CmsImageBlock {
  id: string;
  imageUrl: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface CmsCtaBlock {
  id: string;
  heading: string;
  description?: string;
  buttonLabel: string;
  buttonLink: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface CmsStatsBlock {
  id: string;
  items: Array<{
    label: string;
    value: string;
    icon?: string;
  }>;
}

export interface CmsTestimonialsBlock {
  id: string;
  items: Array<{
    name: string;
    role?: string;
    quote: string;
    avatarUrl?: string;
    rating?: number;
  }>;
}

export interface CmsFaqBlock {
  id: string;
  items: Array<{
    question: string;
    answer: string;
  }>;
}

// ── Page layout ──────────────────────────────────────────────────────────────

export interface CmsLayout {
  header?: CmsBannerItem[];
  slider?: CmsSliderItem[];
  body?: CmsContentBlock[];
  lists?: CmsListBlock[];
  hero?: CmsHeroBlock[];
  textBlocks?: CmsTextBlock[];
  images?: CmsImageBlock[];
  cta?: CmsCtaBlock[];
  stats?: CmsStatsBlock[];
  testimonials?: CmsTestimonialsBlock[];
  faq?: CmsFaqBlock[];
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
