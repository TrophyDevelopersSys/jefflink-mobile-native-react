import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { AuditLogService } from './services/audit-log.service';
import { AdminUsersService } from './services/admin-users.service';
import { AdminListingsService } from './services/admin-listings.service';
import { AdminFinanceService } from './services/admin-finance.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminVendorsService } from './services/admin-vendors.service';
import { AdminGuard } from './guards/admin.guard';
import { DatabaseModule } from '../../database/database.module';
import { RedisModule } from '../../redis/redis.module';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [
    AdminService,
    AuditLogService,
    AdminUsersService,
    AdminListingsService,
    AdminFinanceService,
    AdminAnalyticsService,
    AdminVendorsService,
    AdminGuard,
  ],
  controllers: [AdminController],
  exports: [AuditLogService],
})
export class AdminModule {}

