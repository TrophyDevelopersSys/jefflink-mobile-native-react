import { Router } from "express";
import type { Pool } from "pg";

export function listingsRouter(pool: Pool): Router {
  const router = Router();

  /* GET /listings/vehicles */
  router.get("/vehicles", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        make: string;
        model: string;
        year: number;
        selling_price: string;
      }>(
        `SELECT id, make, model, year, selling_price
         FROM vehicles
         WHERE status = 'AVAILABLE'
         ORDER BY created_at DESC
         LIMIT 100`
      );

      return res.json(
        result.rows.map((r) => ({
          id: r.id,
          title: `${r.year} ${r.make} ${r.model}`.trim(),
          type: "vehicle",
          location: "",
          price: `UGX ${Number(r.selling_price).toLocaleString()}`,
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* GET /listings/properties */
  router.get("/properties", async (_req, res, next) => {
    try {
      const result = await pool.query<{
        id: string;
        type: string;
        location: string;
        price: string;
      }>(
        `SELECT id, type, location, price
         FROM properties
         WHERE status = 'AVAILABLE'
         ORDER BY created_at DESC
         LIMIT 100`
      );

      return res.json(
        result.rows.map((r) => ({
          id: r.id,
          title: r.type ?? "Property",
          type: "property",
          location: r.location ?? "",
          price: `UGX ${Number(r.price).toLocaleString()}`,
        }))
      );
    } catch (err) {
      return next(err);
    }
  });

  /* GET /listings/:id — vehicle or property */
  router.get("/:id", async (req, res, next) => {
    try {
      const { id } = req.params;

      const veh = await pool.query<{
        id: string;
        make: string;
        model: string;
        year: number;
        selling_price: string;
        chassis_number: string;
        engine_number: string;
        import_source: string;
        is_finance_eligible: boolean;
        status: string;
      }>(
        `SELECT id, make, model, year, selling_price, chassis_number,
                engine_number, import_source, is_finance_eligible, status
         FROM vehicles WHERE id = $1`,
        [id]
      );

      if ((veh.rowCount ?? 0) > 0) {
        const v = veh.rows[0];
        return res.json({
          id: v.id,
          title: `${v.year} ${v.make} ${v.model}`.trim(),
          type: "vehicle",
          location: "",
          price: `UGX ${Number(v.selling_price).toLocaleString()}`,
          description: `${v.make} ${v.model} (${v.year})`,
          attributes: {
            make: v.make,
            model: v.model,
            year: v.year,
            chassis: v.chassis_number ?? "",
            engine: v.engine_number ?? "",
            importSource: v.import_source ?? "",
            financeEligible: v.is_finance_eligible,
            status: v.status,
          },
        });
      }

      const prop = await pool.query<{
        id: string;
        type: string;
        location: string;
        price: string;
        plot_size: string;
        is_finance_approved: boolean;
        status: string;
      }>(
        `SELECT id, type, location, price, plot_size, is_finance_approved, status
         FROM properties WHERE id = $1`,
        [id]
      );

      if ((prop.rowCount ?? 0) > 0) {
        const p = prop.rows[0];
        return res.json({
          id: p.id,
          title: p.type ?? "Property",
          type: "property",
          location: p.location ?? "",
          price: `UGX ${Number(p.price).toLocaleString()}`,
          description: `${p.type} in ${p.location}`,
          attributes: {
            plotSize: p.plot_size ?? "",
            financeApproved: p.is_finance_approved,
            status: p.status,
          },
        });
      }

      return res.status(404).json({ message: "Listing not found" });
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
