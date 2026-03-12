import { Router } from "express";
import type { Pool } from "pg";
import { requireAuth } from "../middleware/auth";
import { momoWebhookHandler } from "../services/paymentWebhook";
import { manualInstallmentPayment } from "../services/manualPayment";

const FINANCE_ROLES = ["ADMIN", "MANAGER", "SYSTEM_ADMIN", "DIRECTOR", "FINANCE_OFFICER"] as const;

function mapPaymentStatus(s: string): "pending" | "paid" | "overdue" | "failed" {
  switch (s.toUpperCase()) {
    case "SUCCESS": return "paid";
    case "FAILED":  return "failed";
    case "OVERDUE": return "overdue";
    default:        return "pending";
  }
}

function mapInstallmentStatus(s: string): "pending" | "paid" | "overdue" | "failed" {
  switch (s.toUpperCase()) {
    case "PAID":    return "paid";
    case "OVERDUE": return "overdue";
    case "FAILED":  return "failed";
    default:        return "pending";
  }
}

export function paymentsRouter(pool: Pool): Router {
  const router = Router();

  /* GET /payments  OR  GET /payments?contractId=xxx (installments) */
  router.get("/", requireAuth, async (req, res, next) => {
    try {
      const contractId = req.query.contractId as string | undefined;

      if (contractId) {
        const result = await pool.query<{
          id: string;
          due_date: string;
          amount_due: string;
          penalty_amount: string;
          status: string;
        }>(
          `SELECT id, due_date, amount_due, penalty_amount, status
           FROM installments
           WHERE contract_id = $1
           ORDER BY due_date ASC`,
          [contractId]
        );

        return res.json(
          result.rows.map((r) => ({
            id: r.id,
            dueDate: r.due_date,
            amount: String(Number(r.amount_due) + Number(r.penalty_amount)),
            status: mapInstallmentStatus(r.status),
          }))
        );
      }

      const result = await pool.query<{
        id: string;
        contract_id: string;
        amount: string;
        status: string;
        created_at: string;
      }>(
        `SELECT id, contract_id, amount, status, created_at
         FROM payments
         WHERE user_id = $1
         ORDER BY created_at DESC`,
        [req.auth!.sub]
      );

      return res.json(
        result.rows.map((r) => ({
          id: r.id,
          contractId: r.contract_id,
          amount: r.amount,
          status: mapPaymentStatus(r.status),
          paidAt: r.status === "SUCCESS" ? r.created_at : undefined,
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* GET /payments/:id */
  router.get("/:id", requireAuth, async (req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        contract_id: string;
        amount: string;
        status: string;
        created_at: string;
        user_id: string;
      }>(
        `SELECT id, contract_id, amount, status, created_at, user_id
         FROM payments WHERE id = $1`,
        [req.params.id]
      );

      const payment = result.rows[0];
      if (!payment) return res.status(404).json({ message: "Payment not found" });

      const isFinance = (FINANCE_ROLES as readonly string[]).includes(req.auth!.role);
      if (!isFinance && payment.user_id !== req.auth!.sub) {
        return res.status(403).json({ message: "Forbidden" });
      }

      return res.json({
        id: payment.id,
        contractId: payment.contract_id,
        amount: payment.amount,
        status: mapPaymentStatus(payment.status),
        paidAt: payment.status === "SUCCESS" ? payment.created_at : undefined,
      });
    } catch (err) {
      return next(err);
    }
  });

  /* POST /payments/:id/approve — manual payment approval */
  router.post("/:id/approve", requireAuth, async (req, res, next) => {
    try {
      const isFinance = (FINANCE_ROLES as readonly string[]).includes(req.auth!.role);
      if (!isFinance) return res.status(403).json({ message: "Forbidden" });

      const { amount, debitAccount, creditAccount } = req.body as {
        amount: number;
        debitAccount: string;
        creditAccount: string;
      };

      const result = await manualInstallmentPayment(pool, {
        paymentId: req.params.id,
        amount,
        debitAccount,
        creditAccount,
      });

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  /* POST /payments/webhook/momo — MoMo reconciliation webhook */
  router.post("/webhook/momo", momoWebhookHandler(pool));

  return router;
}
