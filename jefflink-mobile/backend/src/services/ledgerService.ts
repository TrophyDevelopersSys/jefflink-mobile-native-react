import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export const postLedgerTransaction = async (
  pool: Pool,
  input: {
    referenceType: string;
    referenceId?: string | null;
    reference?: string | null;
    description?: string | null;
    debitAccount: string;
    creditAccount: string;
    amount: number;
  }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    const result = await client.query<{ id: string }>(
      "SELECT create_ledger_transaction($1, $2, $3, $4, $5, $6, $7) AS id",
      [
        input.referenceType,
        input.referenceId ?? null,
        input.reference ?? null,
        input.description ?? null,
        input.debitAccount,
        input.creditAccount,
        input.amount
      ]
    );

    return { ledgerTransactionId: result.rows[0].id } as const;
  });
};
