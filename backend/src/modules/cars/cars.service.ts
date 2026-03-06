import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and, gte, lte, ilike, desc, count } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { RedisService } from '../../redis/redis.service';
import { vehicles } from '../../database/schema';
import { ConfigService } from '@nestjs/config';
import { CreateCarDto, UpdateCarDto } from './dto/car.dto';
import { PaginationDto, paginate } from '../../common/dto/pagination.dto';

export interface CarFilterDto extends PaginationDto {
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  type?: string;
  make?: string;
  status?: string;
}

@Injectable()
export class CarsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async findAll(filters: CarFilterDto) {
    const ttl = this.config.get<number>('app.cacheTtlListings', 300);
    const cacheKey = `cars:list:${JSON.stringify(filters)}`;

    return this.redis.remember(cacheKey, ttl, async () => {
      const conditions = [eq(vehicles.status, filters.status ?? 'AVAILABLE')];

      if (filters.location) {
        conditions.push(ilike(vehicles.location!, `%${filters.location}%`));
      }
      if (filters.type) {
        conditions.push(ilike(vehicles.type!, `%${filters.type}%`));
      }
      if (filters.make) {
        conditions.push(ilike(vehicles.make!, `%${filters.make}%`));
      }
      if (filters.minPrice !== undefined) {
        conditions.push(gte(vehicles.price!, String(filters.minPrice)));
      }
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(vehicles.price!, String(filters.maxPrice)));
      }

      const where = and(...conditions);

      const [rows, [{ value: total }]] = await Promise.all([
        this.db.db
          .select({
            id: vehicles.id,
            title: vehicles.title,
            make: vehicles.make,
            model: vehicles.model,
            year: vehicles.year,
            type: vehicles.type,
            location: vehicles.location,
            price: vehicles.price,
            currency: vehicles.currency,
            status: vehicles.status,
            createdAt: vehicles.createdAt,
          })
          .from(vehicles)
          .where(where)
          .orderBy(desc(vehicles.createdAt))
          .limit(filters.limit)
          .offset(filters.offset),
        this.db.db
          .select({ value: count() })
          .from(vehicles)
          .where(where),
      ]);

      return paginate(rows, Number(total), filters);
    });
  }

  async findById(id: string) {
    const cacheKey = `car:${id}`;
    return this.redis.remember(cacheKey, 600, async () => {
      const result = await this.db.db
        .select()
        .from(vehicles)
        .where(eq(vehicles.id, id))
        .limit(1);

      if (!result[0]) throw new NotFoundException('Vehicle not found');
      return result[0];
    });
  }

  async create(vendorId: string, dto: CreateCarDto) {
    const [car] = await this.db.db
      .insert(vehicles)
      .values({
        ...dto,
        vendorId,
        price: dto.price ? String(dto.price) : undefined,
        status: 'AVAILABLE',
      })
      .returning();

    await this.redis.invalidatePattern('cars:list:*');
    return car;
  }

  async update(id: string, dto: UpdateCarDto) {
    const [updated] = await this.db.db
      .update(vehicles)
      .set({ ...dto, price: dto.price ? String(dto.price) : undefined, updatedAt: new Date() })
      .where(eq(vehicles.id, id))
      .returning();

    if (!updated) throw new NotFoundException('Vehicle not found');

    await Promise.all([
      this.redis.del(`car:${id}`),
      this.redis.invalidatePattern('cars:list:*'),
    ]);

    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.db.db
      .update(vehicles)
      .set({ status: 'INACTIVE', updatedAt: new Date() })
      .where(eq(vehicles.id, id));

    await Promise.all([
      this.redis.del(`car:${id}`),
      this.redis.invalidatePattern('cars:list:*'),
    ]);
  }
}
