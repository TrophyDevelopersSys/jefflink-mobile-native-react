import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export const runPenaltySweep = async (
  pool: Pool,
  input?: { graceDays?: number; defaultDays?: number }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    await client.query("SELECT detect_overdue_contracts($1, $2)", [
      input?.graceDays ?? 0,
      input?.defaultDays ?? 30
    ]);
    return { status: "executed" } as const;
  });
};
