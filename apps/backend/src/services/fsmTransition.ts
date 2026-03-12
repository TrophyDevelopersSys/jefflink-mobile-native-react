import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export type ContractStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "DEFAULT_WARNING"
  | "OVERDUE"
  | "DEFAULT"
  | "REPOSSESSION"
  | "CLOSED"
  | "CANCELLED";

export const transitionContract = async (
  pool: Pool,
  input: { contractId: string; toStatus: ContractStatus }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    const contract = await client.query(
      "SELECT status FROM contracts WHERE id = $1 FOR UPDATE",
      [input.contractId]
    );

    if (!contract.rowCount) {
      throw new Error("Contract not found");
    }

    await client.query(
      "UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2",
      [input.toStatus, input.contractId]
    );

    return { status: "updated" } as const;
  });
};
