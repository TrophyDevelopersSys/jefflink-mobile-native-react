import { DynamicModule, Logger, Module } from '@nestjs/common';
import { BullModule, getQueueToken } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const QUEUE_MEDIA = 'media';
export const QUEUE_NOTIFICATIONS = 'notifications';
export const QUEUE_PAYMENTS = 'payments';
export const QUEUE_SEARCH = 'search-indexing';

const ALL_QUEUES = [QUEUE_MEDIA, QUEUE_NOTIFICATIONS, QUEUE_PAYMENTS, QUEUE_SEARCH];

@Module({})
export class QueueModule {
  /**
   * Returns real BullMQ queues when REDIS_URL is set (or in production),
   * otherwise returns null stubs so the server starts without Redis.
   * Services must use @Optional() on @InjectQueue and guard queue.add() calls.
   */
  static register(): DynamicModule {
    const hasRedis = !!process.env['REDIS_URL'];

    if (!hasRedis) {
      new Logger('QueueModule').warn(
        'REDIS_URL not set — queue operations are disabled (no-op stubs). ' +
          'Set REDIS_URL to enable background job processing.',
      );
      const stubs = ALL_QUEUES.map((name) => ({
        provide: getQueueToken(name),
        useValue: null,
      }));
      return {
        module: QueueModule,
        providers: stubs,
        exports: stubs.map((s) => s.provide),
      };
    }

    return {
      module: QueueModule,
      imports: [
        BullModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (config: ConfigService) => ({
            connection: {
              url: config.get<string>('redis.url', 'redis://localhost:6379'),
            },
          }),
          inject: [ConfigService],
        }),
        BullModule.registerQueue(
          { name: QUEUE_MEDIA },
          { name: QUEUE_NOTIFICATIONS },
          { name: QUEUE_PAYMENTS },
          { name: QUEUE_SEARCH },
        ),
      ],
      exports: [BullModule],
    };
  }
}

