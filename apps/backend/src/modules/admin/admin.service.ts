import { Injectable } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { users, contracts, payments, withdrawals } from '../../database/schema';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  async getDashboardStats() {
    return this.redis.remember('admin:stats', 60, async () => {
      const [userCount] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(users);

      const [contractCount] = await this.db.db
        .select({ count: sql<number>`count(*)` })
        .from(contracts);

      const paymentStatsResult = await this.db.executeRaw<{
        successful: string;
        pending: string;
        total_volume: string;
      }>(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'SUCCESS') AS successful,
          COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
          COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0) AS total_volume
        FROM payments`,
        [],
      );
      const paymentStats = paymentStatsResult[0] ?? {};

      return {
        users: userCount?.count ?? 0,
        contracts: contractCount?.count ?? 0,
        payments: paymentStats,
      };
    });
  }

  async getUsers(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        phone: users.phone,
        status: users.status,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'BANNED') {
    await this.db.db
      .update(users)
      .set({ status, updatedAt: new Date() })
      .where(eq(users.id, userId));
    await this.redis.del(`user:${userId}`);
  }

  async getContracts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select()
      .from(contracts)
      .orderBy(desc(contracts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPayments(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getPendingWithdrawals() {
    return this.db.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.status, 'PENDING'))
      .orderBy(desc(withdrawals.createdAt));
  }

  async syncRecovery() {
    // Trigger recovery check via stored procedure
    await this.db.executeRaw(`SELECT sync_recovery_queue()`, []).catch(() => {});
    return { message: 'Recovery sync triggered' };
  }
}
