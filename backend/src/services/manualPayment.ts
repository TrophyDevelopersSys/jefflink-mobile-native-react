import type { Pool, PoolClient } from "pg";
import { withTransaction } from "../utils/transaction";

export const manualInstallmentPayment = async (
  pool: Pool,
  input: {
    paymentId: string;
    amount: number;
    debitAccount: string;
    creditAccount: string;
  }
) => {
  return withTransaction(pool, async (client: PoolClient) => {
    const payment = await client.query(
      "SELECT id, amount, status, contract_id FROM payments WHERE id = $1 FOR UPDATE",
      [input.paymentId]
    );

    if (!payment.rowCount) {
      throw new Error("Payment not found");
    }

    const current = payment.rows[0];
    if (current.status === "SUCCESS") {
      return { status: "idempotent" } as const;
    }

    if (Number(current.amount) !== input.amount) {
      throw new Error("Amount mismatch");
    }

    await client.query(
      "UPDATE payments SET status = 'SUCCESS', updated_at = NOW() WHERE id = $1",
      [input.paymentId]
    );

    await client.query("SELECT apply_payment_to_installments($1, $2)", [
      current.contract_id,
      input.amount
    ]);

    await client.query(
      "SELECT create_ledger_transaction($1, $2, $3, $4, $5, $6, $7)",
      [
        "PAYMENT",
        input.paymentId,
        null,
        "Manual payment approval",
        input.debitAccount,
        input.creditAccount,
        input.amount
      ]
    );

    return { status: "success" } as const;
  });
};
