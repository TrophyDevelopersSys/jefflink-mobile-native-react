import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service';
import { vendorWallets, withdrawals, ledgerTransactions } from '../../database/schema';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class WalletService {
  constructor(
    private readonly db: DatabaseService,
    private readonly redis: RedisService,
  ) {}

  async getWallet(userId: string) {
    return this.redis.remember(
      `wallet:${userId}`,
      120,
      async () => {
        const [wallet] = await this.db.db
          .select()
          .from(vendorWallets)
          .where(eq(vendorWallets.vendorId, userId))
          .limit(1);

        if (!wallet) throw new NotFoundException('Wallet not found');
        return wallet;
      },
    );
  }

  async getTransactions(userId: string) {
    // Ledger transactions are linked via debit/credit account strings, not a walletId FK
    // Filter by looking up the user's account reference
    const accountRef = `vendor:${userId}`;
    return this.db.db
      .select()
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.debitAccount, accountRef))
      .orderBy(desc(ledgerTransactions.createdAt));
  }

  async requestWithdrawal(
    userId: string,
    amount: number,
    momoNumber: string,
    note?: string,
  ) {
    await this.db.executeRaw(
      `SELECT request_vendor_withdrawal($1, $2, $3, $4)`,
      [userId, amount, momoNumber, note ?? null],
    ).catch(async () => {
      // Fallback direct insert if stored procedure is unavailable
      const [wallet] = await this.db.db
        .select()
        .from(vendorWallets)
        .where(eq(vendorWallets.vendorId, userId))
        .limit(1);

      if (!wallet) throw new NotFoundException('Wallet not found');

      if (Number(wallet.balance) < amount) {
        throw new BadRequestException('Insufficient balance');
      }

      await this.db.db.insert(withdrawals).values({
        vendorId: userId,
        amount: String(amount),
        currency: wallet.currency ?? 'UGX',
        status: 'PENDING',
      });
    });

    await this.redis.del(`wallet:${userId}`);
  }

  async processWithdrawal(
    withdrawalId: string,
    approverId: string,
    action: 'APPROVE' | 'REJECT',
  ) {
    const [withdrawal] = await this.db.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.id, withdrawalId))
      .limit(1);

    if (!withdrawal) throw new NotFoundException('Withdrawal not found');
    if (withdrawal.status !== 'PENDING') {
      throw new BadRequestException('Withdrawal is not pending');
    }

    await this.db.executeRaw(
      `SELECT process_vendor_withdrawal($1, $2, $3)`,
      [withdrawalId, approverId, action],
    ).catch(async () => {
      // Fallback
      const newStatus = action === 'APPROVE' ? 'PROCESSED' : 'REJECTED';
      await this.db.db
        .update(withdrawals)
        .set({ status: newStatus, processedAt: new Date() } as any)
        .where(eq(withdrawals.id, withdrawalId));
    });

    await this.redis.del(`wallet:${withdrawal.vendorId}`);
  }

  async listWithdrawals(userId: string, isAdmin = false) {
    if (isAdmin) {
      return this.db.db
        .select()
        .from(withdrawals)
        .orderBy(desc(withdrawals.createdAt));
    }

    return this.db.db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.vendorId, userId))
      .orderBy(desc(withdrawals.createdAt));
  }
}
