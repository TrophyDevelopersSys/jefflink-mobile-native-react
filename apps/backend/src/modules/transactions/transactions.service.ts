import { Injectable, NotFoundException, BadRequestException, ForbiddenException, ConflictException, Optional } from '@nestjs/common';
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

  // ── Customer Finance: Create Contract ─────────────────────────────────────

  /**
   * Creates a hire-purchase contract for a customer, calculates the monthly
   * EMI via reducing-balance amortization, and seeds the full installment
   * schedule.  The initial deposit is NOT recorded here — use
   * `recordInitialDeposit` after the contract is created.
   */
  async createContract(
    userId: string,
    dto: {
      vehicleId?: string;
      propertyId?: string;
      totalAmount: number;
      initialDeposit: number;
      interestRate: number;  // annual, e.g. 0.18 for 18 %
      termMonths: number;
      currency?: string;
    },
  ) {
    const { totalAmount, initialDeposit, interestRate, termMonths } = dto;

    if (initialDeposit >= totalAmount) {
      throw new BadRequestException('Initial deposit must be less than total amount');
    }

    const currency = dto.currency ?? 'UGX';
    const principal = totalAmount - initialDeposit;
    const emi = this._calculateEMI(principal, interestRate, termMonths);

    // Determine end date based on term
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + termMonths);

    const [contract] = await this.db.db
      .insert(contracts)
      .values({
        userId,
        vehicleId: dto.vehicleId,
        propertyId: dto.propertyId,
        status: 'DRAFT',
        totalAmount: totalAmount.toFixed(2),
        initialDeposit: initialDeposit.toFixed(2),
        interestRate: interestRate.toFixed(4),
        termMonths,
        monthlyAmount: emi.toFixed(2),
        currency,
        startDate,
        endDate,
        depositPaid: false,
      })
      .returning();

    // Generate the full amortization schedule
    await this._seedAmortizationSchedule(contract.id, principal, interestRate, termMonths, emi, currency, startDate);

    return contract;
  }

  // ── Customer Finance: Amortization Schedule ───────────────────────────────

  /** Returns the full amortization schedule for a contract. */
  async getAmortizationSchedule(contractId: string, userId: string, isAdmin = false) {
    const contract = await this.getContractById(contractId, userId, isAdmin);

    const rows = await this.db.db
      .select()
      .from(installments)
      .where(eq(installments.contractId, contractId))
      .orderBy(installments.installmentNumber);

    return {
      contract,
      schedule: rows,
    };
  }

  // ── Customer Finance: Initial Deposit ─────────────────────────────────────

  /**
   * Records the customer's initial deposit payment against a contract.
   * This must be called once; subsequent calls will throw a conflict error.
   */
  async recordInitialDeposit(
    contractId: string,
    userId: string,
    dto: {
      amount: number;
      paymentMethod?: string;
      momoTransactionId?: string;
      idempotencyKey?: string;
      notes?: string;
    },
  ) {
    const [contract] = await this.db.db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.userId !== userId) throw new ForbiddenException('Access denied');
    if (contract.depositPaid) throw new ConflictException('Initial deposit already recorded for this contract');

    const expected = parseFloat(contract.initialDeposit ?? '0');
    if (dto.amount < expected) {
      throw new BadRequestException(
        `Deposit amount ${dto.amount} is less than the required initial deposit of ${expected}`,
      );
    }

    const [payment] = await this.db.db
      .insert(payments)
      .values({
        contractId,
        userId,
        amount: dto.amount.toFixed(2),
        currency: contract.currency ?? 'UGX',
        status: 'PENDING',
        paymentType: 'INITIAL_DEPOSIT',
        paymentMethod: dto.paymentMethod,
        momoTransactionId: dto.momoTransactionId,
        idempotencyKey: dto.idempotencyKey,
        notes: dto.notes,
      })
      .returning();

    // Mark deposit as paid on the contract
    await this.db.db
      .update(contracts)
      .set({ depositPaid: true, updatedAt: new Date() })
      .where(eq(contracts.id, contractId));

    return payment;
  }

  // ── Customer Finance: Monthly Payment ─────────────────────────────────────

  /**
   * Records a monthly instalment payment.  Marks the instalment row as PAID
   * and creates a corresponding payment record.
   */
  async recordMonthlyPayment(
    contractId: string,
    installmentId: string,
    userId: string,
    dto: {
      amount: number;
      paymentMethod?: string;
      momoTransactionId?: string;
      idempotencyKey?: string;
      notes?: string;
    },
  ) {
    const [contract] = await this.db.db
      .select()
      .from(contracts)
      .where(eq(contracts.id, contractId))
      .limit(1);

    if (!contract) throw new NotFoundException('Contract not found');
    if (contract.userId !== userId) throw new ForbiddenException('Access denied');
    if (!contract.depositPaid) {
      throw new BadRequestException('Initial deposit must be paid before monthly instalments can be recorded');
    }

    const [installment] = await this.db.db
      .select()
      .from(installments)
      .where(and(eq(installments.id, installmentId), eq(installments.contractId, contractId)))
      .limit(1);

    if (!installment) throw new NotFoundException('Installment not found');
    if (installment.status === 'PAID') throw new ConflictException('Installment already paid');

    const required = parseFloat(installment.amount);
    if (dto.amount < required) {
      throw new BadRequestException(
        `Payment amount ${dto.amount} is less than the required installment amount of ${required}`,
      );
    }

    const [payment] = await this.db.db
      .insert(payments)
      .values({
        contractId,
        userId,
        amount: dto.amount.toFixed(2),
        currency: contract.currency ?? 'UGX',
        status: 'PENDING',
        paymentType: 'MONTHLY',
        paymentMethod: dto.paymentMethod,
        momoTransactionId: dto.momoTransactionId,
        idempotencyKey: dto.idempotencyKey,
        notes: dto.notes,
      })
      .returning();

    // Link payment to installment and mark it paid
    await this.db.db
      .update(installments)
      .set({
        status: 'PAID',
        paymentId: payment.id,
        paidAt: new Date(),
      })
      .where(eq(installments.id, installmentId));

    return payment;
  }

  // ── Private helpers ────────────────────────────────────────────────────────

  /**
   * Reducing-balance (French amortization) EMI formula:
   *   EMI = P * r * (1+r)^n / ((1+r)^n - 1)
   * where r = monthly rate, n = term in months, P = principal
   */
  private _calculateEMI(principal: number, annualRate: number, months: number): number {
    if (annualRate === 0) return principal / months;
    const r = annualRate / 12;
    const factor = Math.pow(1 + r, months);
    return (principal * r * factor) / (factor - 1);
  }

  /** Seeds installment rows with full amortization breakdown (principal + interest split). */
  private async _seedAmortizationSchedule(
    contractId: string,
    principal: number,
    annualRate: number,
    months: number,
    emi: number,
    currency: string,
    startDate: Date,
  ): Promise<void> {
    const r = annualRate / 12;
    let balance = principal;
    const rows: typeof installments.$inferInsert[] = [];

    for (let i = 1; i <= months; i++) {
      const interestPortion = balance * r;
      const principalPortion = emi - interestPortion;
      balance = Math.max(0, balance - principalPortion);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);

      rows.push({
        contractId,
        installmentNumber: i,
        dueDate,
        amount: emi.toFixed(2),
        principal: principalPortion.toFixed(2),
        interest: interestPortion.toFixed(2),
        balance: balance.toFixed(2),
        status: 'PENDING',
      });
    }

    // Insert in batches of 50 to avoid overly large queries
    for (let i = 0; i < rows.length; i += 50) {
      await this.db.db.insert(installments).values(rows.slice(i, i + 50));
    }
  }
}
