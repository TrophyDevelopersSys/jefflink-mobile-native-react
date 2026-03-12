import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Optional } from '@nestjs/common';
import { eq, and, desc } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from '../../database/database.service';
import { contracts, payments, installments } from '../../database/schema';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUE_PAYMENTS } from '../../queue/queue.module';

type ContractStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'OVERDUE'
  | 'DEFAULT_WARNING'
  | 'DEFAULT'
  | 'REPOSSESSION'
  | 'SETTLED'
  | 'CLOSED'
  | 'CANCELLED';

const FSM_TRANSITIONS: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ['PENDING_APPROVAL', 'CANCELLED'],
  PENDING_APPROVAL: ['APPROVED', 'CANCELLED'],
  APPROVED: ['ACTIVE', 'CANCELLED'],
  ACTIVE: ['OVERDUE', 'SETTLED', 'CLOSED'],
  OVERDUE: ['DEFAULT_WARNING', 'ACTIVE'],
  DEFAULT_WARNING: ['DEFAULT', 'ACTIVE'],
  DEFAULT: ['REPOSSESSION', 'ACTIVE'],
  REPOSSESSION: ['CLOSED'],
  SETTLED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

@Injectable()
export class TransactionsService {
  constructor(
    private readonly db: DatabaseService,
    @Optional() @InjectQueue(QUEUE_PAYMENTS) private readonly paymentQueue: Queue | null,
  ) {}

  // ── Contracts ──────────────────────────────────────────────────────────────

  async getContracts(userId: string, isAdmin = false) {
    const query = this.db.db
      .select()
      .from(contracts)
      .orderBy(desc(contracts.createdAt));

    if (!isAdmin) {
      return query.where(eq(contracts.userId, userId));
    }
    return query;
  }

  async getContractById(id: string, userId: string, isAdmin = false) {
    const result = await this.db.db
      .select()
      .from(contracts)
      .where(eq(contracts.id, id))
      .limit(1);

    if (!result[0]) throw new NotFoundException('Contract not found');

    if (!isAdmin && result[0].userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return result[0];
  }

  async transitionContract(
    contractId: string,
    toStatus: ContractStatus,
  ): Promise<void> {
    await this.db.withTransaction(async (client) => {
      const res = await client.query(
        `SELECT status FROM contracts WHERE id = $1 FOR UPDATE`,
        [contractId],
      );
      const current = (res.rows[0] as { status: ContractStatus } | undefined)?.status;
      if (!current) throw new NotFoundException('Contract not found');

      const allowed = FSM_TRANSITIONS[current] ?? [];
      if (!allowed.includes(toStatus)) {
        throw new BadRequestException(
          `Invalid transition: ${current} → ${toStatus}`,
        );
      }

      await client.query(
        `UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2`,
        [toStatus, contractId],
      );
    });
  }

  async activateContract(contractId: string): Promise<void> {
    await this.db.executeRaw(
      `SELECT activate_contract($1)`,
      [contractId],
    ).catch(() => {
      // Fallback if stored procedure doesn't exist yet
      return this.transitionContract(contractId, 'ACTIVE');
    });
  }

  // ── Payments ───────────────────────────────────────────────────────────────

  async getPayments(userId: string, contractId?: string, isAdmin = false) {
    if (contractId) {
      return this.db.db
        .select()
        .from(installments)
        .where(eq(installments.contractId, contractId))
        .orderBy(desc(installments.dueDate));
    }

    const query = this.db.db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));

    if (!isAdmin) {
      return query.where(eq(payments.userId, userId));
    }

    return query;
  }

  async getPaymentById(id: string, userId: string, isAdmin = false) {
    const result = await this.db.db
      .select()
      .from(payments)
      .where(eq(payments.id, id))
      .limit(1);

    if (!result[0]) throw new NotFoundException('Payment not found');

    if (!isAdmin && result[0].userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return result[0];
  }

  async approvePayment(
    paymentId: string,
    approvedBy: string,
    debitAccount: string,
    creditAccount: string,
  ): Promise<void> {
    const [payment] = await this.db.db
      .select()
      .from(payments)
      .where(and(eq(payments.id, paymentId), eq(payments.status, 'PENDING')))
      .limit(1);

    if (!payment) {
      throw new NotFoundException('Pending payment not found');
    }

    await this.db.withTransaction(async (client) => {
      // Mark payment SUCCESS
      await client.query(
        `UPDATE payments SET status = 'SUCCESS', approved_by = $1, paid_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [approvedBy, paymentId],
      );

      // Call legacy ledger SP or fallback to direct insert
      await client
        .query(`SELECT create_ledger_transaction($1, $2, $3, $4, $5, $6)`, [
          debitAccount,
          creditAccount,
          payment.amount,
          payment.currency,
          paymentId,
          'payment',
        ])
        .catch(() => {
          // SP may not exist; proceed
        });
    });

    // Queue background analytics aggregation (no-op when Redis is unavailable)
    await this.paymentQueue?.add('analytics', {
      type: 'analytics',
      payload: { paymentId, amount: payment.amount },
    });
  }

  async handleMomoWebhook(body: {
    transactionId: string;
    amount: number;
    status: string;
    reference: string;
  }): Promise<void> {
    if (body.status !== 'SUCCESS') return;

    const [payment] = await this.db.db
      .select()
      .from(payments)
      .where(eq(payments.idempotencyKey, body.transactionId))
      .limit(1);

    if (!payment || payment.status === 'SUCCESS') return;

    await this.db.withTransaction(async (client) => {
      await client.query(
        `UPDATE payments SET status = 'SUCCESS', momo_transaction_id = $1, paid_at = NOW(), updated_at = NOW() WHERE id = $2`,
        [body.transactionId, payment.id],
      );
    });
  }

  // ── Penalty sweep (called by admin or cron) ────────────────────────────────

  async runPenaltySweep(graceDays = 3, defaultDays = 30): Promise<void> {
    await this.db.executeRaw(
      `SELECT detect_overdue_contracts($1, $2)`,
      [graceDays, defaultDays],
    ).catch(() => {
      // SP not available; skip silently
    });

    await this.paymentQueue?.add('penalty-sweep', {
      type: 'penalty-sweep',
      payload: { graceDays, defaultDays },
    });
  }
}
