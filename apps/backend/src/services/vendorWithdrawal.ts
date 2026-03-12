import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export const requestVendorWithdrawal = async (
  pool: Pool,
  input: { vendorId: string; amount: number }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    const result = await client.query<{ id: string }>(
      "SELECT request_vendor_withdrawal($1, $2) AS id",
      [input.vendorId, input.amount]
    );

    return { withdrawalId: result.rows[0].id } as const;
  });
};

export const processVendorWithdrawal = async (
  pool: Pool,
  input: {
    withdrawalId: string;
    status: "APPROVED" | "REJECTED";
    approvedBy: string;
    debitAccount: string;
    creditAccount: string;
  }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    await client.query(
      "SELECT process_vendor_withdrawal($1, $2, $3, $4, $5)",
      [
        input.withdrawalId,
        input.status,
        input.approvedBy,
        input.debitAccount,
        input.creditAccount
      ]
    );

    return { status: "processed" } as const;
  });
};
