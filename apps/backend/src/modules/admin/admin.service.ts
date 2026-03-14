import { Injectable } from '@nestjs/common';
import { AuditLogService, type AuditActor } from './services/audit-log.service';
import { AdminUsersService, type UserStatus } from './services/admin-users.service';
import { AdminListingsService, type ReportStatus } from './services/admin-listings.service';
import { AdminFinanceService } from './services/admin-finance.service';
import { AdminAnalyticsService } from './services/admin-analytics.service';
import { AdminVendorsService } from './services/admin-vendors.service';
import type { UpdateUserStatusDto } from './dto/update-user-status.dto';
import type { ApproveListingDto, RejectListingDto } from './dto/approve-listing.dto';
import type { ResolveReportDto } from './dto/resolve-report.dto';
import type { VerifyVendorDto, SuspendVendorDto } from './dto/vendor-action.dto';

/**
 * AdminService is the orchestration layer.
 * It holds no direct database logic — it delegates entirely to
 * specialised sub-services and provides a single surface for the controller.
 */
@Injectable()
export class AdminService {
  constructor(
    private readonly analytics: AdminAnalyticsService,
    private readonly users: AdminUsersService,
    private readonly listings: AdminListingsService,
    private readonly finance: AdminFinanceService,
    private readonly vendors: AdminVendorsService,
    private readonly audit: AuditLogService,
  ) {}

  // ── Analytics ─────────────────────────────────────────────────────────────
  getDashboardStats() { return this.analytics.getDashboardStats(); }
  getRevenueTimeline() { return this.analytics.getRevenueTimeline(); }
  getRecentActivity(limit?: number) { return this.analytics.getRecentActivity(limit); }

  // ── Users ─────────────────────────────────────────────────────────────────
  listUsers(page: number, limit: number, search?: string) {
    return this.users.listUsers(page, limit, search);
  }
  getUserById(id: string) { return this.users.getUserById(id); }
  updateUserStatus(actor: AuditActor, userId: string, dto: UpdateUserStatusDto) {
    return this.users.updateUserStatus(actor, userId, dto.status as UserStatus);
  }

  // ── Vendors ───────────────────────────────────────────────────────────────
  listVendors(page: number, limit: number) { return this.vendors.listVendors(page, limit); }
  getVendorDetail(id: string) { return this.vendors.getVendorDetail(id); }
  verifyVendor(actor: AuditActor, id: string, dto: VerifyVendorDto) {
    return this.vendors.verifyVendor(actor, id, dto.note);
  }
  suspendVendor(actor: AuditActor, id: string, dto: SuspendVendorDto) {
    return this.vendors.suspendVendor(actor, id, dto.reason);
  }

  // ── Listings ──────────────────────────────────────────────────────────────
  getPendingVehicles(page: number, limit: number) {
    return this.listings.getPendingVehicles(page, limit);
  }
  approveVehicle(actor: AuditActor, id: string, dto: ApproveListingDto) {
    return this.listings.approveVehicle(actor, id, dto.note);
  }
  rejectVehicle(actor: AuditActor, id: string, dto: RejectListingDto) {
    return this.listings.rejectVehicle(actor, id, dto.reason);
  }
  getPendingProperties(page: number, limit: number) {
    return this.listings.getPendingProperties(page, limit);
  }
  approveProperty(actor: AuditActor, id: string, dto: ApproveListingDto) {
    return this.listings.approveProperty(actor, id, dto.note);
  }
  rejectProperty(actor: AuditActor, id: string, dto: RejectListingDto) {
    return this.listings.rejectProperty(actor, id, dto.reason);
  }

  // ── Reports ───────────────────────────────────────────────────────────────
  getReports(page: number, limit: number, status?: ReportStatus) {
    return this.listings.getReports(page, limit, status);
  }
  resolveReport(actor: AuditActor, id: string, dto: ResolveReportDto) {
    return this.listings.resolveReport(actor, id, dto.resolution, dto.resolutionNote);
  }

  // ── Finance ───────────────────────────────────────────────────────────────
  getFinanceSummary() { return this.finance.getFinanceSummary(); }
  listContracts(page: number, limit: number) { return this.finance.listContracts(page, limit); }
  getContractDetail(id: string) { return this.finance.getContractDetail(id); }
  listPayments(page: number, limit: number) { return this.finance.listPayments(page, limit); }
  listInstallments(page: number, limit: number, status?: string) {
    return this.finance.listInstallments(page, limit, status);
  }
  listWithdrawals(page: number, limit: number) { return this.finance.listWithdrawals(page, limit); }
  approveWithdrawal(actor: AuditActor, id: string) {
    return this.finance.approveWithdrawal(actor, id);
  }
  rejectWithdrawal(actor: AuditActor, id: string, reason: string) {
    return this.finance.rejectWithdrawal(actor, id, reason);
  }
}


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
