import {
  Injectable,
  Logger,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ObjectId } from 'mongodb';
import { MongoService } from '../../../mongo/mongo.service';
import type { CmsStore, CmsPageQuery } from './cms-store.interface';
import type {
  CmsPage,
  CmsPageRevision,
  CmsNavigation,
  CmsSettings,
  CmsPlatform,
} from './cms.types';

@Injectable()
export class CmsAtlasStore implements CmsStore {
  private readonly logger = new Logger(CmsAtlasStore.name);

  private readonly pagesCol: string;
  private readonly revisionsCol: string;
  private readonly navigationCol: string;
  private readonly settingsCol: string;

  constructor(
    private readonly mongo: MongoService,
    private readonly config: ConfigService,
  ) {
    this.pagesCol = this.config.get<string>('mongo.collections.cmsPages', 'cms_pages');
    this.revisionsCol = this.config.get<string>('mongo.collections.cmsPageRevisions', 'cms_page_revisions');
    this.navigationCol = this.config.get<string>('mongo.collections.cmsNavigation', 'cms_navigation');
    this.settingsCol = this.config.get<string>('mongo.collections.cmsSettings', 'cms_settings');
  }

  // ── Helpers ──────────────────────────────────────────────────────────────

  private pages() {
    return this.mongo.collection<CmsPage>(this.pagesCol);
  }

  private revisions() {
    return this.mongo.collection<CmsPageRevision>(this.revisionsCol);
  }

  private navigation() {
    return this.mongo.collection<CmsNavigation>(this.navigationCol);
  }

  private settings() {
    return this.mongo.collection<CmsSettings>(this.settingsCol);
  }

  private toId(id: string) {
    return new ObjectId(id);
  }

  private serialize<T extends { _id?: unknown }>(doc: T | null): T | null {
    if (!doc) return null;
    return { ...doc, _id: doc._id?.toString() } as T;
  }

  // ── Pages ────────────────────────────────────────────────────────────────

  async findPage(query: CmsPageQuery): Promise<CmsPage | null> {
    const filter: Record<string, unknown> = {};
    if (query.slug) filter['slug'] = query.slug;
    if (query.platform) filter['platform'] = { $in: [query.platform, 'ALL'] };
    if (query.locale) filter['locale'] = query.locale;

    if (query.preview) {
      // Preview: return latest version regardless of status
      filter['status'] = { $in: ['DRAFT', 'PUBLISHED'] };
    } else {
      filter['status'] = 'PUBLISHED';
    }

    const doc = await this.pages()
      .find(filter)
      .sort({ version: -1 })
      .limit(1)
      .next();

    return this.serialize(doc);
  }

  async findPages(query: CmsPageQuery): Promise<CmsPage[]> {
    const filter: Record<string, unknown> = {};
    if (query.slug) filter['slug'] = query.slug;
    if (query.platform) filter['platform'] = { $in: [query.platform, 'ALL'] };
    if (query.locale) filter['locale'] = query.locale;
    if (query.status) filter['status'] = query.status;

    const docs = await this.pages()
      .find(filter)
      .sort({ updatedAt: -1 })
      .toArray();

    return docs.map((d: CmsPage) => this.serialize(d)!);
  }

  async createPage(page: Omit<CmsPage, '_id' | 'version' | 'updatedAt'>): Promise<CmsPage> {
    const now = new Date().toISOString();
    const doc: CmsPage = {
      ...page,
      version: 1,
      status: page.status ?? 'DRAFT',
      updatedAt: now,
    };

    try {
      const result = await this.pages().insertOne(doc as any);
      const created = { ...doc, _id: result.insertedId.toString() };

      // First revision
      await this.revisions().insertOne({
        pageId: created._id!,
        slug: created.slug,
        version: 1,
        snapshot: created,
        createdAt: now,
        createdBy: created.updatedBy,
      } as any);

      return created;
    } catch (err: any) {
      if (err?.code === 11000) {
        throw new ConflictException(`Page with slug "${page.slug}" already exists for this platform/locale`);
      }
      throw err;
    }
  }

  async updatePage(id: string, patch: Partial<CmsPage>, expectedVersion?: number): Promise<CmsPage> {
    const filter: Record<string, unknown> = { _id: this.toId(id) };
    if (expectedVersion !== undefined) {
      filter['version'] = expectedVersion;
    }

    const now = new Date().toISOString();
    const updateDoc: Record<string, unknown> = {
      $set: { ...patch, updatedAt: now },
      $inc: { version: 1 },
    };
    // Remove fields that shouldn't be set directly
    delete (updateDoc['$set'] as any)['_id'];
    delete (updateDoc['$set'] as any)['version'];

    const result = await this.pages().findOneAndUpdate(filter, updateDoc, {
      returnDocument: 'after',
    });

    if (!result) {
      throw new NotFoundException(
        expectedVersion
          ? `Page not found or version mismatch (expected v${expectedVersion})`
          : 'Page not found',
      );
    }

    // Save revision
    const page = this.serialize(result)!;
    await this.revisions().insertOne({
      pageId: page._id!,
      slug: page.slug,
      version: page.version,
      snapshot: page,
      createdAt: now,
      createdBy: page.updatedBy,
    } as any);

    return page;
  }

  async publishPage(id: string, status: 'PUBLISHED' | 'ARCHIVED'): Promise<CmsPage> {
    const now = new Date().toISOString();
    const sets: Record<string, unknown> = { status, updatedAt: now };
    if (status === 'PUBLISHED') sets['publishedAt'] = now;

    const result = await this.pages().findOneAndUpdate(
      { _id: this.toId(id) },
      { $set: sets, $inc: { version: 1 } },
      { returnDocument: 'after' },
    );

    if (!result) throw new NotFoundException('Page not found');

    const page = this.serialize(result)!;

    await this.revisions().insertOne({
      pageId: page._id!,
      slug: page.slug,
      version: page.version,
      snapshot: page,
      createdAt: now,
      createdBy: page.updatedBy,
    } as any);

    return page;
  }

  async deletePage(id: string): Promise<void> {
    const result = await this.pages().deleteOne({ _id: this.toId(id) });
    if (result.deletedCount === 0) throw new NotFoundException('Page not found');
  }

  // ── Revisions ────────────────────────────────────────────────────────────

  async findRevisions(pageId: string): Promise<CmsPageRevision[]> {
    const docs = await this.revisions()
      .find({ pageId })
      .sort({ version: -1 })
      .toArray();
    return docs.map((d: CmsPageRevision) => this.serialize(d)!);
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  async findNavigation(key: string, platform: CmsPlatform): Promise<CmsNavigation | null> {
    const doc = await this.navigation().findOne({
      key,
      platform: { $in: [platform, 'ALL'] },
    });
    return this.serialize(doc);
  }

  async upsertNavigation(nav: Omit<CmsNavigation, '_id' | 'updatedAt'>): Promise<CmsNavigation> {
    const now = new Date().toISOString();
    const result = await this.navigation().findOneAndUpdate(
      { key: nav.key, platform: nav.platform },
      { $set: { ...nav, updatedAt: now } },
      { upsert: true, returnDocument: 'after' },
    );
    return this.serialize(result)!;
  }

  // ── Settings ─────────────────────────────────────────────────────────────

  async getSettings(): Promise<CmsSettings | null> {
    const doc = await this.settings().findOne({});
    return this.serialize(doc);
  }

  async updateSettings(patch: Partial<CmsSettings>): Promise<CmsSettings> {
    const now = new Date().toISOString();
    const result = await this.settings().findOneAndUpdate(
      {},
      { $set: { ...patch, updatedAt: now } },
      { upsert: true, returnDocument: 'after' },
    );
    return this.serialize(result)!;
  }

  // ── Homepage (Atlas-backed, builds from cms_pages slug=homepage) ─────────

  async getHomepage() {
    const page = await this.findPage({ slug: 'homepage', platform: 'ALL', locale: 'en' });

    if (!page) {
      return { heroSliders: [], heroBanners: [], content: {} };
    }

    const heroSliders = page.layout.slider ?? [];
    const heroBanners = page.layout.header ?? [];
    const content: Record<string, string> = {};
    for (const block of page.layout.body ?? []) {
      content[block.key] = block.value;
    }

    return { heroSliders, heroBanners, content };
  }
}
