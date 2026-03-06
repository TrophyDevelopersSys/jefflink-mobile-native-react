import { Global, Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { RedisService } from './redis.service';

/**
 * Shared Redis client provider.
 * - Production / explicit REDIS_URL → real ioredis connection.
 * - Development without REDIS_URL → ioredis-mock (in-memory, no Redis needed).
 */
const redisClientProvider = {
  provide: 'REDIS_CLIENT',
  useFactory: (config: ConfigService): Redis => {
    const url = config.get<string>('redis.url');
    const isDev = config.get<string>('NODE_ENV') !== 'production';

    if (!url && isDev) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const RedisMock = require('ioredis-mock') as typeof Redis;
      const mock = new RedisMock() as unknown as Redis;
      new Logger('RedisModule').warn(
        'REDIS_URL not set — using in-memory ioredis-mock (dev only)',
      );
      return mock;
    }

    return url
      ? new Redis(url)
      : new Redis({
          host: config.get<string>('redis.host', 'localhost'),
          port: config.get<number>('redis.port', 6379),
          password: config.get<string>('redis.password'),
          db: config.get<number>('redis.db', 0),
        });
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [redisClientProvider, RedisService],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
