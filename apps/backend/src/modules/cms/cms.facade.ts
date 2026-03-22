import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CmsStore, CmsPageQuery } from './stores/cms-store.interface';
import { CmsAtlasStore } from './stores/cms-atlas.store';
import { CmsNeonStore } from './stores/cms-neon.store';
import { RedisService } from '../../redis/redis.service';
import { AuditLogService, type AuditActor } from '../admin/services/audit-log.service';
import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsPlatform,
} from './stores/cms.types';

const CMS_CACHE_TTL = 300; // 5 min

@Injectable()
export class CmsFacade {
  private readonly logger = new Logger(CmsFacade.name);

  constructor(
    private readonly atlasStore: CmsAtlasStore,
    private readonly neonStore: CmsNeonStore,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
    private readonly audit: AuditLogService,
  ) {}

  private get store(): CmsStore {
    return this.config.get<boolean>('mongo.cmsAtlasEnabled')
      ? this.atlasStore
      : this.neonStore;
  }

  // ── Public reads (with caching) ──────────────────────────────────────────

  async getHomepage() {
    return this.redis.remember('cms:homepage', CMS_CACHE_TTL, () =>
      this.store.getHomepage(),
    );
  }

  async getPage(query: CmsPageQuery): Promise<CmsPage | null> {
    const cacheKey = `cms:page:${query.slug}:${query.platform ?? 'ALL'}:${query.locale ?? 'en'}`;
    if (query.preview) {
      // Never cache previews
      return this.store.findPage(query);
    }
    return this.redis.remember(cacheKey, CMS_CACHE_TTL, () =>
      this.store.findPage(query),
    );
  }

  async getPageRevisions(pageId: string): Promise<CmsPageRevision[]> {
    return this.store.findRevisions(pageId);
  }

  async getNavigation(key: string, platform: CmsPlatform): Promise<CmsNavigation | null> {
    const cacheKey = `cms:navigation:${key}:${platform}`;
    return this.redis.remember(cacheKey, CMS_CACHE_TTL, () =>
      this.store.findNavigation(key, platform),
    );
  }

  async getSettings(): Promise<CmsSettings | null> {
    return this.redis.remember('cms:settings:global', CMS_CACHE_TTL, () =>
      this.store.getSettings(),
    );
  }

  // ── Admin writes (with cache invalidation + audit) ──────────────────────

  async listPages(query: CmsPageQuery): Promise<CmsPage[]> {
    return this.store.findPages(query);
  }

  async getPageById(id: string): Promise<CmsPage | null> {
    return this.store.findPage({ slug: undefined } as any);
  }

  async createPage(actor: AuditActor, page: Omit<CmsPage, '_id' | 'version' | 'updatedAt'>): Promise<CmsPage> {
    const created = await this.store.createPage({ ...page, updatedBy: actor.sub });
    await this.audit.log(actor, 'CMS_CREATE_PAGE', 'cms_page', created._id, {
      slug: created.slug,
      platform: created.platform,
    });
    await this.invalidateCmsCache();
    return created;
  }

  async updatePage(actor: AuditActor, id: string, patch: Partial<CmsPage>, expectedVersion?: number): Promise<CmsPage> {
    const updated = await this.store.updatePage(id, { ...patch, updatedBy: actor.sub }, expectedVersion);
    await this.audit.log(actor, 'CMS_UPDATE_PAGE', 'cms_page', id, {
      fields: Object.keys(patch),
      version: updated.version,
    });
    await this.invalidateCmsCache();
    return updated;
  }

  async publishPage(actor: AuditActor, id: string, status: 'PUBLISHED' | 'ARCHIVED'): Promise<CmsPage> {
    const page = await this.store.publishPage(id, status, actor.sub);
    await this.audit.log(actor, status === 'PUBLISHED' ? 'CMS_PUBLISH_PAGE' : 'CMS_ARCHIVE_PAGE', 'cms_page', id, {
      slug: page.slug,
      version: page.version,
    });
    await this.invalidateCmsCache();
    return page;
  }

  async deletePage(actor: AuditActor, id: string): Promise<void> {
    await this.store.deletePage(id);
    await this.audit.log(actor, 'CMS_DELETE_PAGE', 'cms_page', id);
    await this.invalidateCmsCache();
  }

  async upsertNavigation(actor: AuditActor, nav: Omit<CmsNavigation, '_id' | 'updatedAt'>): Promise<CmsNavigation> {
    const result = await this.store.upsertNavigation(nav);
    await this.audit.log(actor, 'CMS_UPSERT_NAVIGATION', 'cms_navigation', nav.key, {
      platform: nav.platform,
      itemCount: nav.items.length,
    });
    await this.redis.invalidatePattern('cms:navigation:*');
    return result;
  }

  async updateSettings(actor: AuditActor, patch: Partial<CmsSettings>): Promise<CmsSettings> {
    const result = await this.store.updateSettings(patch);
    await this.audit.log(actor, 'CMS_UPDATE_SETTINGS', 'cms_settings', 'global', {
      fields: Object.keys(patch),
    });
    await this.redis.del('cms:settings:global');
    return result;
  }

  // ── Cache helpers ────────────────────────────────────────────────────────

  private async invalidateCmsCache(): Promise<void> {
    await this.redis.invalidatePattern('cms:*');
  }
}
