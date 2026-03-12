import { Router } from "express";
import type { Pool } from "pg";
import { requireAuth } from "../middleware/auth";
import { requestVendorWithdrawal, processVendorWithdrawal } from "../services/vendorWithdrawal";

export function walletRouter(pool: Pool): Router {
  const router = Router();

  /* GET /wallet — balance overview */
  router.get("/", requireAuth, async (req, res, next) => {
    try {
      const result = await pool.query<{ vendor_id: string; balance: string }>(
        `SELECT v.id AS vendor_id, w.balance
         FROM vendors v
         JOIN wallets w ON w.vendor_id = v.id
         WHERE v.user_id = $1`,
        [req.auth!.sub]
      );

      if ((result.rowCount ?? 0) === 0) {
        return res.json({ vendorId: null, balance: 0 });
      }

      const { vendor_id, balance } = result.rows[0];
      return res.json({ vendorId: vendor_id, balance: Number(balance) });
    } catch (err) {
      return next(err);
    }
  });

  /* GET /wallet/transactions — withdrawal history for this vendor */
  router.get("/transactions", requireAuth, async (req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        amount: string;
        status: string;
        requested_at: string;
        approved_at: string | null;
      }>(
        `SELECT vw.id, vw.amount, vw.status, vw.requested_at, vw.approved_at
         FROM vendor_withdrawals vw
         JOIN vendors v ON v.id = vw.vendor_id
         WHERE v.user_id = $1
         ORDER BY vw.requested_at DESC
         LIMIT 50`,
        [req.auth!.sub]
      );

      return res.json(
        result.rows.map((r) => ({
          id: r.id,
          amount: r.amount,
          type: "WITHDRAWAL",
          description: `Withdrawal — ${r.status}`,
          createdAt: r.requested_at,
          settledAt: r.approved_at ?? undefined,
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* POST /wallet/withdraw — request a withdrawal */
  router.post("/withdraw", requireAuth, async (req, res, next) => {
    try {
      const vendorResult = await pool.query<{ id: string }>(
        "SELECT id FROM vendors WHERE user_id = $1",
        [req.auth!.sub]
      );
      if ((vendorResult.rowCount ?? 0) === 0) {
        return res.status(403).json({ message: "Not a vendor" });
      }

      const { amount } = req.body as { amount: number };
      const result = await requestVendorWithdrawal(pool, {
        vendorId: vendorResult.rows[0].id,
        amount,
      });

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  /* POST /wallet/withdraw/:id/process — admin approve / reject */
  router.post("/withdraw/:id/process", requireAuth, async (req, res, next) => {
    try {
      if (!["ADMIN", "MANAGER"].includes(req.auth!.role)) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const { status, debitAccount, creditAccount } = req.body as {
        status: "APPROVED" | "REJECTED";
        debitAccount: string;
        creditAccount: string;
      };

      const result = await processVendorWithdrawal(pool, {
        withdrawalId: req.params.id,
        status,
        approvedBy: req.auth!.sub,
        debitAccount,
        creditAccount,
      });

      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
