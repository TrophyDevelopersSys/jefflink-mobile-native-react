import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, asc, lte, gte, or, isNull } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { cmsSliders, cmsBanners, cmsContent } from '../../database/schema';
import { CreateSliderDto } from './dto/create-slider.dto';
import { UpsertContentDto } from './dto/upsert-content.dto';

@Injectable()
export class CmsService {
  constructor(private readonly db: DatabaseService) {}

  // ──────────────────────────────────────────────────────────────────────────
  // Homepage – aggregated payload
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Returns everything the homepage needs in a single query batch.
   * Images are R2 CDN URLs — zero backend bandwidth, global edge delivery.
   */
  async getHomepage() {
    const now = new Date();

    const [heroSliders, heroBanners, contentRows] = await Promise.all([
      // Active sliders ordered by sortOrder
      this.db.db
        .select()
        .from(cmsSliders)
        .where(eq(cmsSliders.active, true))
        .orderBy(asc(cmsSliders.sortOrder)),

      // Active banners for home_top placement within their schedule
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

      // All CMS text/SEO blocks
      this.db.db.select().from(cmsContent),
    ]);

    // Convert content rows to a key→value map for easy frontend consumption
    const content: Record<string, string> = {};
    for (const row of contentRows) {
      content[row.key] = row.value;
    }

    return { heroSliders, heroBanners, content };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Sliders
  // ──────────────────────────────────────────────────────────────────────────

  listSliders() {
    return this.db.db
      .select()
      .from(cmsSliders)
      .orderBy(asc(cmsSliders.sortOrder));
  }

  async createSlider(dto: CreateSliderDto) {
    const [slider] = await this.db.db
      .insert(cmsSliders)
      .values({
        title: dto.title,
        subtitle: dto.subtitle,
        imageUrl: dto.imageUrl,
        buttonLabel: dto.buttonLabel,
        buttonLink: dto.buttonLink,
        sortOrder: dto.sortOrder ?? 0,
        active: dto.active ?? true,
      })
      .returning();
    return slider;
  }

  async updateSlider(id: string, dto: Partial<CreateSliderDto>) {
    const [slider] = await this.db.db
      .update(cmsSliders)
      .set({ ...dto, updatedAt: new Date() })
      .where(eq(cmsSliders.id, id))
      .returning();
    if (!slider) throw new NotFoundException('Slider not found');
    return slider;
  }

  async deleteSlider(id: string) {
    const result = await this.db.db
      .delete(cmsSliders)
      .where(eq(cmsSliders.id, id))
      .returning({ id: cmsSliders.id });
    if (!result.length) throw new NotFoundException('Slider not found');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Content blocks
  // ──────────────────────────────────────────────────────────────────────────

  listContent() {
    return this.db.db.select().from(cmsContent);
  }

  async upsertContent(dto: UpsertContentDto) {
    const [row] = await this.db.db
      .insert(cmsContent)
      .values({
        key: dto.key,
        value: dto.value,
        type: dto.type ?? 'text',
        description: dto.description,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: cmsContent.key,
        set: {
          value: dto.value,
          type: dto.type ?? 'text',
          description: dto.description,
          updatedAt: new Date(),
        },
      })
      .returning();
    return row;
  }

  async deleteContent(key: string) {
    const result = await this.db.db
      .delete(cmsContent)
      .where(eq(cmsContent.key, key))
      .returning({ key: cmsContent.key });
    if (!result.length) throw new NotFoundException('Content key not found');
  }
}
