import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, and, gte, lte, ilike, desc, count } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { properties } from '../../database/schema';
import { ConfigService } from '@nestjs/config';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

export interface PropertyFilterDto extends PaginationDto {
  location?: string;
  district?: string;
  propertyType?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  status?: string;
}

@Injectable()
export class PropertiesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async findAll(filters: PropertyFilterDto) {
    const ttl = this.config.get<number>('app.cacheTtlListings', 300);
    const cacheKey = `properties:list:${JSON.stringify(filters)}`;

    return this.redis.remember(cacheKey, ttl, async () => {
      const conditions = [eq(properties.status, filters.status ?? 'AVAILABLE')];

      if (filters.location) {
        conditions.push(ilike(properties.location!, `%${filters.location}%`));
      }
      if (filters.district) {
        conditions.push(ilike(properties.district!, `%${filters.district}%`));
      }
      if (filters.propertyType) {
        conditions.push(eq(properties.propertyType!, filters.propertyType));
      }
      if (filters.minPrice !== undefined) {
        conditions.push(gte(properties.price!, String(filters.minPrice)));
      }
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(properties.price!, String(filters.maxPrice)));
      }
      if (filters.minBedrooms !== undefined) {
        conditions.push(gte(properties.bedrooms!, filters.minBedrooms));
      }

      const where = and(...conditions);

      const [rows, [{ value: total }]] = await Promise.all([
        this.db.db
          .select({
            id: properties.id,
            title: properties.title,
            propertyType: properties.propertyType,
            location: properties.location,
            district: properties.district,
            price: properties.price,
            currency: properties.currency,
            bedrooms: properties.bedrooms,
            bathrooms: properties.bathrooms,
            sizeM2: properties.sizeM2,
            status: properties.status,
            createdAt: properties.createdAt,
          })
          .from(properties)
          .where(where)
          .orderBy(desc(properties.createdAt))
          .limit(filters.limit)
          .offset(filters.offset),
        this.db.db
          .select({ value: count() })
          .from(properties)
          .where(where),
      ]);

      return paginate(rows, Number(total), filters);
    });
  }

  async findById(id: string) {
    return this.redis.remember(`property:${id}`, 600, async () => {
      const result = await this.db.db
        .select()
        .from(properties)
        .where(eq(properties.id, id))
        .limit(1);

      if (!result[0]) throw new NotFoundException('Property not found');
      return result[0];
    });
  }

  async create(vendorId: string, dto: CreatePropertyDto) {
    const [property] = await this.db.db
      .insert(properties)
      .values({
        ...dto,
        vendorId,
        price: dto.price ? String(dto.price) : undefined,
        sizeM2: dto.sizeM2 ? String(dto.sizeM2) : undefined,
        status: 'AVAILABLE',
      })
      .returning();

    await this.redis.invalidatePattern('properties:list:*');
    return property;
  }

  async update(id: string, dto: UpdatePropertyDto) {
    const [updated] = await this.db.db
      .update(properties)
      .set({
        ...dto,
        price: dto.price ? String(dto.price) : undefined,
        sizeM2: dto.sizeM2 ? String(dto.sizeM2) : undefined,
        updatedAt: new Date(),
      })
      .where(eq(properties.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Property not found');

    await Promise.all([
      this.redis.del(`property:${id}`),
      this.redis.invalidatePattern('properties:list:*'),
    ]);

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.db.db
      .update(properties)
      .set({ status: 'INACTIVE', updatedAt: new Date() })
      .where(eq(properties.id, id));

    await Promise.all([
      this.redis.del(`property:${id}`),
      this.redis.invalidatePattern('properties:list:*'),
    ]);
  }
}
