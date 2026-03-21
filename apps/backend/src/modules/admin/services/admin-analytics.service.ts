import { Injectable } from '@nestjs/common';
import { sql, gte, desc, eq } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import { users, vehicles, contracts, payments, adminLogs, notifications } from '../../../database/schema';
import { RedisService } from '../../../redis/redis.service';

@Injectable()
export class AdminAnalyticsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Full dashboard stats — cached for 60 seconds.
   */
  async getDashboardStats() {
    return this.redis.remember('admin:dashboard:stats', 60, async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [userCount] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const [contractCount] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(contracts);

      const [activeContracts] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(contracts)
        .where(sql`status = 'ACTIVE'`);

      const [vehicleCount] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(vehicles);

      const [availableVehicles] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(vehicles)
        .where(sql`status = 'AVAILABLE'`);

      const revenueResult = await this.db.executeRaw<{
        monthly_revenue: string;
        total_revenue: string;
        payments_count: string;
      }>(
        `SELECT
          COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS' AND created_at >= NOW() - INTERVAL '30 days'), 0) AS monthly_revenue,
          COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0) AS total_revenue,
          COUNT(*) FILTER (WHERE status = 'SUCCESS') AS payments_count
        FROM payments`,
        [],
      );

      const revenue = revenueResult[0] ?? {};

      const [newUsersMonth] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(users)
        .where(gte(users.createdAt, thirtyDaysAgo));

      return {
        users: {
          total: Number(userCount?.count ?? 0),
          newThisMonth: Number(newUsersMonth?.count ?? 0),
        },
        vehicles: {
          total: Number(vehicleCount?.count ?? 0),
          available: Number(availableVehicles?.count ?? 0),
        },
        contracts: {
          total: Number(contractCount?.count ?? 0),
          active: Number(activeContracts?.count ?? 0),
        },
        revenue: {
          monthly: Number(revenue.monthly_revenue ?? 0),
          total: Number(revenue.total_revenue ?? 0),
          successfulPayments: Number(revenue.payments_count ?? 0),
        },
      };
    });
  }

  /**
   * Recent admin activity from audit logs.
   */
  async getRecentActivity(limit = 20) {
    return this.db.db
      .select()
      .from(adminLogs)
      .orderBy(desc(adminLogs.createdAt))
      .limit(limit);
  }

  /**
   * Revenue breakdown by month (last 6 months).
   */
  async getRevenueTimeline() {
    return this.db.executeRaw<{
      month: string;
      revenue: string;
      count: string;
    }>(
      `SELECT
        to_char(date_trunc('month', created_at), 'YYYY-MM') AS month,
        COALESCE(SUM(amount), 0) AS revenue,
        COUNT(*) AS count
      FROM payments
      WHERE status = 'SUCCESS'
        AND created_at >= NOW() - INTERVAL '6 months'
      GROUP BY 1
      ORDER BY 1`,
      [],
    );
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  async getNotifications(tab = 'all', page = 1, limit = 25) {
    const offset = (page - 1) * limit;

    const allNotifications = await this.db.db
      .select({
        id: notifications.id,
        userId: notifications.userId,
        type: notifications.type,
        title: notifications.title,
        body: notifications.body,
        isRead: notifications.isRead,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(notifications);

    const mapped = allNotifications.map((n) => ({
      id: n.id,
      channel: 'PUSH',
      recipient: n.userId,
      title: n.title,
      status: n.isRead ? 'READ' : 'DELIVERED',
      sentAt: n.createdAt?.toISOString() ?? '',
    }));

    return {
      requests: { data: [], total: 0 },
      notifications: {
        data: mapped,
        total: Number(countResult?.count ?? 0),
      },
    };
  }

  // ── GPS Tracking ──────────────────────────────────────────────────────────

  async getGpsOverview(_tab = 'all', _page = 1, _limit = 25) {
    // GPS device data requires hardware integration.
    // Return structured placeholder until GPS module is integrated.
    return {
      devices: [],
      alerts: [],
      recoveryCases: [],
      total: 0,
    };
  }

  // ── System Health ─────────────────────────────────────────────────────────

  async getSystemHealth() {
    let dbOk = false;
    try {
      await this.db.executeRaw<{ ok: number }>('SELECT 1 AS ok', []);
      dbOk = true;
    } catch { /* db check failed */ }

    const mem = process.memoryUsage();

    return {
      status: dbOk ? 'healthy' : 'degraded',
      uptime: Math.floor(process.uptime()),
      database: dbOk ? 'connected' : 'disconnected',
      memory: {
        rssBytes: mem.rss,
        heapUsedBytes: mem.heapUsed,
        heapTotalBytes: mem.heapTotal,
      },
      nodeVersion: process.version,
      timestamp: new Date().toISOString(),
    };
  }

  // ── Platform Settings ─────────────────────────────────────────────────────

  async getSettings() {
    return this.redis.remember('admin:platform:settings', 300, async () => ({
      finance: {
        defaultInterestRate: 12,
        maxInstallmentMonths: 60,
        currency: 'UGX',
        minDeposit: 10,
      },
      moderation: {
        autoFlagReportThreshold: 3,
        requireListingReview: true,
        vendorVerificationRequired: true,
      },
      notifications: {
        emailEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
      },
      platform: {
        maintenanceMode: false,
        autoApproveVendors: false,
      },
      audit: {
        adminActionLogging: true,
        logRetention: 'indefinite',
        ipCapture: true,
      },
    }));
  }

  async updateSettings(settings: Record<string, unknown>) {
    // Persist to Redis and invalidate cache
    const current = await this.getSettings();
    const merged = { ...current, ...settings };
    await this.redis.set('admin:platform:settings', JSON.stringify(merged));
    await this.redis.del('admin:platform:settings');
    await this.redis.set('admin:platform:settings:data', JSON.stringify(merged));
    return merged;
  }
}
