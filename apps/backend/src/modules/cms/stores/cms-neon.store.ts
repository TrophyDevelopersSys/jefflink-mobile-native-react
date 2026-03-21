import { Injectable, Logger } from '@nestjs/common';
import { eq, and, asc, lte, gte, or, isNull } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { cmsSliders, cmsBanners, cmsContent } from '../../../database/schema';
import type { CmsStore, CmsPageQuery } from './cms-store.interface';
import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsPlatform,
} from './cms.types';

/**
 * Neon-backed CMS store — wraps the original SQL tables.
 * Serves as the fallback when CMS_ATLAS_ENABLED=false.
 */
@Injectable()
export class CmsNeonStore implements CmsStore {
  private readonly logger = new Logger(CmsNeonStore.name);

  constructor(private readonly db: DatabaseService) {}

  // ── Homepage (the only endpoint the legacy SQL CMS truly supports) ───────

  async getHomepage() {
    const now = new Date();

    const [heroSliders, heroBanners, contentRows] = await Promise.all([
      this.db.db
        .select()
        .from(cmsSliders)
        .where(eq(cmsSliders.active, true))
        .orderBy(asc(cmsSliders.sortOrder)),

      this.db.db
        .select()
        .from(cmsBanners)
        .where(
          and(
            eq(cmsBanners.active, true),
            eq(cmsBanners.placement, 'home_top'),
            or(isNull(cmsBanners.startsAt), lte(cmsBanners.startsAt, now)),
            or(isNull(cmsBanners.endsAt), gte(cmsBanners.endsAt, now)),
          ),
        ),

      this.db.db.select().from(cmsContent),
    ]);

    const content: Record<string, string> = {};
    for (const row of contentRows) {
      content[row.key] = row.value;
    }

    return { heroSliders, heroBanners, content };
  }

  // ── Page CRUD (not supported by the legacy SQL model) ────────────────────
  // These stubs exist so the Neon store satisfies the interface.
  // When Atlas is disabled, the admin page endpoints will return 501.

  async findPage(_query: CmsPageQuery): Promise<CmsPage | null> {
    return null;
  }

  async findPages(_query: CmsPageQuery): Promise<CmsPage[]> {
    return [];
  }

  async createPage(_page: Omit<CmsPage, '_id' | 'version' | 'updatedAt'>): Promise<CmsPage> {
    throw new Error('Page CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }

  async updatePage(_id: string, _patch: Partial<CmsPage>): Promise<CmsPage> {
    throw new Error('Page CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }

  async publishPage(_id: string, _status: 'PUBLISHED' | 'ARCHIVED'): Promise<CmsPage> {
    throw new Error('Page CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }

  async deletePage(_id: string): Promise<void> {
    throw new Error('Page CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }

  async findRevisions(_pageId: string): Promise<CmsPageRevision[]> {
    return [];
  }

  async findNavigation(_key: string, _platform: CmsPlatform): Promise<CmsNavigation | null> {
    return null;
  }

  async upsertNavigation(_nav: Omit<CmsNavigation, '_id' | 'updatedAt'>): Promise<CmsNavigation> {
    throw new Error('Navigation CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }

  async getSettings(): Promise<CmsSettings | null> {
    return null;
  }

  async updateSettings(_patch: Partial<CmsSettings>): Promise<CmsSettings> {
    throw new Error('Settings CRUD requires Atlas. Enable CMS_ATLAS_ENABLED=true.');
  }
}
