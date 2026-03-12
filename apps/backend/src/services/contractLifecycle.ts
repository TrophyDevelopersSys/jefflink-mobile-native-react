import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export const activateContract = async (
  pool: Pool,
  input: { contractId: string }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    const contract = await client.query(
      "SELECT status FROM contracts WHERE id = $1 FOR UPDATE",
      [input.contractId]
    );

    if (!contract.rowCount) {
      throw new Error("Contract not found");
    }

    if (contract.rows[0].status !== "APPROVED") {
      throw new Error("Invalid transition");
    }

    await client.query("SELECT generate_installments_for_contract($1)", [
      input.contractId
    ]);

    await client.query(
      "UPDATE contracts SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1",
      [input.contractId]
    );

    return { status: "activated" } as const;
  });
};

export const closeContractEarly = async (
  pool: Pool,
  input: {
    contractId: string;
    paymentAmount: number;
    debitAccount: string;
    creditAccount: string;
  }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    await client.query(
      "SELECT settle_contract_early($1, $2, $3, $4)",
      [
        input.contractId,
        input.paymentAmount,
        input.debitAccount,
        input.creditAccount
      ]
    );

    return { status: "closed" } as const;
  });
};
