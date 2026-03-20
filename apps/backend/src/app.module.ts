import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CarsModule } from './modules/cars/cars.module';
import { PropertiesModule } from './modules/properties/properties.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { AdminModule } from './modules/admin/admin.module';
import { MediaModule } from './modules/media/media.module';
import { SearchModule } from './modules/search/search.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { CmsModule } from './modules/cms/cms.module';
import { AdminRecoveryModule } from './modules/admin-recovery/admin-recovery.module';
import { HealthModule } from './health/health.module';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import redisConfig from './config/redis.config';
import storageConfig from './config/storage.config';

@Module({
  imports: [
    // ── Global configuration ────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
      load: [appConfig, databaseConfig, jwtConfig, mailConfig, redisConfig, storageConfig],
      cache: true,
    }),

    // ── Structured logging ─────────────────────────────────────────────────
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
        transport:
          process.env['NODE_ENV'] !== 'production'
            ? { target: 'pino-pretty', options: { colorize: true } }
            : undefined,
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    // ── Global rate limiting ───────────────────────────────────────────────
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env['THROTTLE_TTL'] ?? 60_000),
        limit: Number(process.env['THROTTLE_LIMIT'] ?? 120),
      },
    ]),

    // ── Infrastructure ─────────────────────────────────────────────────────
    DatabaseModule,
    RedisModule,
    QueueModule.register(),

    // ── Feature modules ────────────────────────────────────────────────────
    AuthModule,
    UsersModule,
    CarsModule,
    PropertiesModule,
    TransactionsModule,
    WalletModule,
    AdminModule,
    MediaModule,
    SearchModule,
    NotificationsModule,
    CmsModule,
    AdminRecoveryModule,
    HealthModule,
  ],
})
export class AppModule {}
