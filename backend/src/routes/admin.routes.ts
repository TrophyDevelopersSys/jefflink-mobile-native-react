import { Router } from "express";
import type { Pool } from "pg";
import { requireAuth } from "../middleware/auth";
import { requireRole } from "../middleware/rbac";
import { runPenaltySweep } from "../services/penaltyExecution";
import { transitionContract, type ContractStatus } from "../services/fsmTransition";
import { activateContract } from "../services/contractLifecycle";

const adminOnly = requireRole(["ADMIN", "MANAGER", "SYSTEM_ADMIN", "DIRECTOR"]);

export function adminRouter(pool: Pool): Router {
  const router = Router();

  // All admin routes require authentication + admin role
  router.use(requireAuth);
  router.use(adminOnly);

  /* GET /admin/users */
  router.get("/users", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        email: string;
        first_name: string | null;
        last_name: string | null;
        status: string;
        role: string;
      }>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.status, r.name AS role
         FROM users u
         JOIN roles r ON r.id = u.role_id
         ORDER BY u.created_at DESC`
      );

      return res.json(
        result.rows.map((u) => ({
          id: u.id,
          email: u.email,
          fullName: `${u.first_name ?? ""} ${u.last_name ?? ""}`.trim(),
          role: u.role,
          status: u.status.toLowerCase(),
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* GET /admin/contracts */
  router.get("/contracts", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        status: string;
        cash_price: string;
        hire_price: string;
        term_months: number;
        start_date: string | null;
        end_date: string | null;
        user_email: string;
        user_name: string;
      }>(
        `SELECT c.id, c.status, c.cash_price, c.hire_price, c.term_months,
                c.start_date, c.end_date,
                u.email AS user_email,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name
         FROM contracts c
         JOIN users u ON u.id = c.user_id
         ORDER BY c.created_at DESC`
      );

      return res.json(result.rows);
    } catch (err) {
      return next(err);
    }
  });

  /* GET /admin/payments — pending payments queue */
  router.get("/payments", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        contract_id: string;
        amount: string;
        status: string;
        method: string | null;
        created_at: string;
      }>(
        `SELECT id, contract_id, amount, status, method, created_at
         FROM payments
         WHERE status = 'PENDING'
         ORDER BY created_at DESC`
      );

      return res.json(
        result.rows.map((r) => ({
          id: r.id,
          contractId: r.contract_id,
          amount: r.amount,
          status: "pending" as const,
          method: r.method,
          createdAt: r.created_at,
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* GET /admin/recovery — overdue / defaulted contracts */
  router.get("/recovery", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        status: string;
        cash_price: string;
        user_email: string;
        user_name: string;
      }>(
        `SELECT c.id, c.status, c.cash_price,
                u.email AS user_email,
                CONCAT(u.first_name, ' ', u.last_name) AS user_name
         FROM contracts c
         JOIN users u ON u.id = c.user_id
         WHERE c.status IN ('DEFAULT', 'REPOSSESSION', 'OVERDUE', 'DEFAULT_WARNING')
         ORDER BY c.updated_at DESC`
      );

      return res.json(result.rows);
    } catch (err) {
      return next(err);
    }
  });

  /* GET /admin/sync — run penalty sweep and return status */
  router.get("/sync", async (_req, res, next) => {
    try {
      const result = await runPenaltySweep(pool);
      return res.json({ ...result, lastSyncAt: new Date().toISOString() });
    } catch (err) {
      return next(err);
    }
  });

  /* POST /admin/contracts/:id/transition — FSM status change */
  router.post("/contracts/:id/transition", async (req, res, next) => {
    try {
      const { toStatus } = req.body as { toStatus: ContractStatus };
      const result = await transitionContract(pool, {
        contractId: req.params.id,
        toStatus,
      });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  /* POST /admin/contracts/:id/activate — approve + generate installments */
  router.post("/contracts/:id/activate", async (req, res, next) => {
    try {
      const result = await activateContract(pool, { contractId: req.params.id });
      return res.json(result);
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
