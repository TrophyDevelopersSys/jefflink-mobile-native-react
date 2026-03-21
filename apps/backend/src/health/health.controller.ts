import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { DatabaseService } from '../database/database.service';
import { RedisService } from '../redis/redis.service';
import { MongoHealthIndicator } from '../mongo/mongo.health';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

@Injectable()
export class DatabaseHealthIndicator extends HealthIndicator {
  constructor(private readonly db: DatabaseService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.db.db.execute(sql`SELECT 1`);
      return this.getStatus(key, true);
    } catch {
      return this.getStatus(key, false, { message: 'Database unreachable' });
    }
  }
}

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redis: RedisService) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      const result = await this.redis.get<string>('__health__');
      return this.getStatus(key, true);
    } catch {
      return this.getStatus(key, false, { message: 'Redis unreachable' });
    }
  }
}

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly dbIndicator: DatabaseHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly mongoIndicator: MongoHealthIndicator,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.dbIndicator.isHealthy('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.mongoIndicator.isHealthy('mongo'),
      () => this.memory.checkHeap('memory_heap', 512 * 1024 * 1024),
    ]);
  }
}
