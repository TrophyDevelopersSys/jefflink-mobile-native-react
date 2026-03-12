import type { PoolClient } from "pg";
import type { AuthClaims } from "../middleware/rbac";

export const buildBranchFilter = (claims?: AuthClaims) => {
  if (!claims?.branchId) {
    return { clause: "", values: [] as unknown[] };
  }
  return { clause: "AND branch_id = $1", values: [claims.branchId] };
};

export const assertBranchMatch = async (
  client: PoolClient,
  table: string,
  id: string,
  branchId?: string
) => {
  if (!branchId) return;
  const result = await client.query(
    `SELECT 1 FROM ${table} WHERE id = $1 AND branch_id = $2`,
    [id, branchId]
  );
  if (!result.rowCount) {
    throw new Error("branch_forbidden");
  }
};
