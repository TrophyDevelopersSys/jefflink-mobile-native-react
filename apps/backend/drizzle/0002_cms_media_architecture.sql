-- ============================================================================
-- JeffLink CMS & Media Architecture Migration
-- Adds: media_assets.status, cms_sliders, cms_banners, cms_content
-- Run against Neon PostgreSQL
-- ============================================================================

-- ── media_assets: add status column ─────────────────────────────────────────
ALTER TABLE media_assets
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS media_status_idx ON media_assets (status);

-- ── CMS: Hero Sliders ───────────────────────────────────────────────────────
-- Rows here drive the homepage hero carousel.
-- image_url points to Cloudflare R2 via cdn.jefflinkcars.com.
CREATE TABLE IF NOT EXISTS cms_sliders (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        VARCHAR(255) NOT NULL,
  subtitle     TEXT,
  image_url    TEXT        NOT NULL,
  button_label VARCHAR(100),
  button_link  VARCHAR(500),
  sort_order   INTEGER     NOT NULL DEFAULT 0,
  active       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_sliders_active_idx ON cms_sliders (active);
CREATE INDEX IF NOT EXISTS cms_sliders_order_idx  ON cms_sliders (sort_order);

-- ── CMS: Banners ─────────────────────────────────────────────────────────────
-- Promotional banners keyed by placement (e.g. "home_top", "cars_sidebar").
-- Supports optional scheduling via starts_at / ends_at.
CREATE TABLE IF NOT EXISTS cms_banners (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  placement   VARCHAR(100) NOT NULL,
  image_url   TEXT        NOT NULL,
  link_url    VARCHAR(500),
  alt_text    VARCHAR(255),
  active      BOOLEAN     NOT NULL DEFAULT TRUE,
  starts_at   TIMESTAMPTZ,
  ends_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cms_banners_placement_idx ON cms_banners (placement);

-- ── CMS: Generic content / SEO blocks ────────────────────────────────────────
-- Key-value store for all CMS text, titles, meta tags, button labels.
-- Structured data stays in Postgres — never in R2.
CREATE TABLE IF NOT EXISTS cms_content (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  key         VARCHAR(255) NOT NULL UNIQUE,
  value       TEXT        NOT NULL,
  type        VARCHAR(50)  NOT NULL DEFAULT 'text',  -- text | html | json | url
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS cms_content_key_idx ON cms_content (key);

-- ── Seed: default homepage content blocks ────────────────────────────────────
INSERT INTO cms_content (key, value, type, description) VALUES
  ('homepage_hero_title',    'Find Your Dream Car',             'text', 'Hero section main heading'),
  ('homepage_hero_subtitle', 'Affordable cars across Uganda',   'text', 'Hero section subheading'),
  ('homepage_cta_label',     'Browse Cars',                     'text', 'Primary CTA button label'),
  ('homepage_cta_link',      '/cars',                           'url',  'Primary CTA button URL'),
  ('seo_homepage_title',     'JeffLink – Cars, Houses & Land in Uganda', 'text', 'Page <title> for homepage'),
  ('seo_homepage_description','Buy, sell and finance cars, houses and land across Uganda with JeffLink.', 'text', 'Meta description for homepage')
ON CONFLICT (key) DO NOTHING;
