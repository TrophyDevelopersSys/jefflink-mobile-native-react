import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';
import { DatabaseService } from '../../../database/database.service';
import {
  contracts,
  payments,
  installments,
  withdrawals,
  vendorWallets,
  users,
} from '../../../database/schema';
import type { AuditActor } from './audit-log.service';
import { AuditLogService } from './audit-log.service';

@Injectable()
export class AdminFinanceService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditLogService,
  ) {}

  // ── Contracts ─────────────────────────────────────────────────────────────

  async listContracts(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select({
        id: contracts.id,
        userId: contracts.userId,
        vehicleId: contracts.vehicleId,
        propertyId: contracts.propertyId,
        status: contracts.status,
        totalAmount: contracts.totalAmount,
        initialDeposit: contracts.initialDeposit,
        monthlyAmount: contracts.monthlyAmount,
        termMonths: contracts.termMonths,
        depositPaid: contracts.depositPaid,
        startDate: contracts.startDate,
        endDate: contracts.endDate,
        currency: contracts.currency,
        createdAt: contracts.createdAt,
      })
      .from(contracts)
      .orderBy(desc(contracts.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async getContractDetail(contractId: string) {
    const [contract] = await this.db.db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);

    if (!contract) throw new NotFoundException(`Contract ${contractId} not found`);

    const contractPayments = await this.db.db
      .select()
      .from(payments)
      .where(eq(payments.contractId, contractId))
      .orderBy(desc(payments.createdAt));

    const schedule = await this.db.db
      .select()
      .from(installments)
      .where(eq(installments.contractId, contractId))
      .orderBy(installments.installmentNumber);

    return { contract, payments: contractPayments, schedule };
  }

  // ── Payments ──────────────────────────────────────────────────────────────

  async listPayments(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select({
        id: payments.id,
        contractId: payments.contractId,
        userId: payments.userId,
        amount: payments.amount,
        currency: payments.currency,
        status: payments.status,
        paymentType: payments.paymentType,
        paymentMethod: payments.paymentMethod,
        momoTransactionId: payments.momoTransactionId,
        paidAt: payments.paidAt,
        createdAt: payments.createdAt,
      })
      .from(payments)
      .orderBy(desc(payments.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // ── Installments ──────────────────────────────────────────────────────────

  async listInstallments(page = 1, limit = 20, status?: string) {
    const offset = (page - 1) * limit;
    const query = this.db.db
      .select()
      .from(installments)
      .orderBy(desc(installments.dueDate))
      .limit(limit)
      .offset(offset);

    if (status) {
      return this.db.db
        .select()
        .from(installments)
        .where(eq(installments.status, status))
        .orderBy(desc(installments.dueDate))
        .limit(limit)
        .offset(offset);
    }

    return query;
  }

  // ── Withdrawals ───────────────────────────────────────────────────────────

  async listWithdrawals(page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.db.db
      .select({
        id: withdrawals.id,
        vendorId: withdrawals.vendorId,
        amount: withdrawals.amount,
        currency: withdrawals.currency,
        status: withdrawals.status,
        approvedBy: withdrawals.approvedBy,
        processedAt: withdrawals.processedAt,
        createdAt: withdrawals.createdAt,
      })
      .from(withdrawals)
      .orderBy(desc(withdrawals.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async approveWithdrawal(actor: AuditActor, withdrawalId: string) {
    const [existing] = await this.db.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Withdrawal ${withdrawalId} not found`);

    await this.db.db
      .update(withdrawals)
      .set({ status: 'APPROVED', approvedBy: actor.sub, processedAt: new Date() })
      .where(eq(withdrawals.id, withdrawalId));

    await this.audit.log(actor, 'APPROVE_WITHDRAWAL', 'withdrawal', withdrawalId, {
      amount: existing.amount,
      vendorId: existing.vendorId,
    });

    return { id: withdrawalId, status: 'APPROVED' };
  }

  async rejectWithdrawal(actor: AuditActor, withdrawalId: string, reason: string) {
    const [existing] = await this.db.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (!existing) throw new NotFoundException(`Withdrawal ${withdrawalId} not found`);

    await this.db.db
      .update(withdrawals)
      .set({ status: 'REJECTED', approvedBy: actor.sub, processedAt: new Date() })
      .where(eq(withdrawals.id, withdrawalId));

    await this.audit.log(actor, 'REJECT_WITHDRAWAL', 'withdrawal', withdrawalId, {
      amount: existing.amount,
      reason,
    });

    return { id: withdrawalId, status: 'REJECTED' };
  }

  // ── Finance summary ───────────────────────────────────────────────────────

  async getFinanceSummary() {
    const [activeContracts] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(contracts)
      .where(eq(contracts.status, 'ACTIVE'));

    const revenueResult = await this.db.executeRaw<{
      total_volume: string;
      successful_count: string;
      pending_count: string;
    }>(
      `SELECT
        COALESCE(SUM(amount) FILTER (WHERE status = 'SUCCESS'), 0) AS total_volume,
        COUNT(*) FILTER (WHERE status = 'SUCCESS') AS successful_count,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count
      FROM payments`,
      [],
    );

    const [overdueInstallments] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(installments)
      .where(eq(installments.status, 'OVERDUE'));

    const [pendingWithdrawals] = await this.db.db
      .select({ count: sql<number>`count(*)` })
      .from(withdrawals)
      .where(eq(withdrawals.status, 'PENDING'));

    return {
      activeContracts: Number(activeContracts?.count ?? 0),
      revenue: revenueResult[0] ?? {},
      overdueInstallments: Number(overdueInstallments?.count ?? 0),
      pendingWithdrawals: Number(pendingWithdrawals?.count ?? 0),
    };
  }
}
