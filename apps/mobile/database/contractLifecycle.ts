import type { Pool, PoolClient } from "pg";

export type ContractStatus =
  | "DRAFT"
  | "UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "OVERDUE"
  | "DEFAULT"
  | "REPOSSESSION"
  | "CLOSED"
  | "CANCELLED";

const allowedTransitions: Record<ContractStatus, ContractStatus[]> = {
  DRAFT: ["UNDER_REVIEW"],
  UNDER_REVIEW: ["APPROVED", "CANCELLED"],
  APPROVED: ["ACTIVE", "CANCELLED"],
  ACTIVE: ["OVERDUE", "CLOSED"],
  OVERDUE: ["ACTIVE", "DEFAULT"],
  DEFAULT: ["REPOSSESSION", "ACTIVE"],
  REPOSSESSION: ["CLOSED"],
  CLOSED: [],
  CANCELLED: []
};

export interface TransitionInput {
  contractId: string;
  toStatus: ContractStatus;
  changedBy?: string | null;
  reason?: string | null;
}

const assertTransition = (from: ContractStatus, to: ContractStatus) => {
  if (!allowedTransitions[from]?.includes(to)) {
    throw new Error(`Illegal transition: ${from} -> ${to}`);
  }
};

export const transitionContractStatus = async (
  pool: Pool,
  input: TransitionInput
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const current = await client.query<{
      status: ContractStatus;
    }>("SELECT status FROM contracts WHERE id = $1 FOR UPDATE", [
      input.contractId
    ]);

    if (!current.rowCount) {
      throw new Error("Contract not found");
    }

    const fromStatus = current.rows[0].status;
    assertTransition(fromStatus, input.toStatus);

    await client.query(
      "UPDATE contracts SET status = $1, updated_at = NOW() WHERE id = $2",
      [input.toStatus, input.contractId]
    );

    await client.query(
      "INSERT INTO contract_status_audit (contract_id, from_status, to_status, changed_by, change_reason) VALUES ($1, $2, $3, $4, $5)",
      [
        input.contractId,
        fromStatus,
        input.toStatus,
        input.changedBy ?? null,
        input.reason ?? null
      ]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export const runOverdueDetection = async (
  client: PoolClient,
  graceDays = 0,
  defaultDays = 30
) => {
  await client.query("SELECT detect_overdue_contracts($1, $2)", [
    graceDays,
    defaultDays
  ]);
};
