import "dotenv/config";
import express, { type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { pool, checkDbConnection } from "./db";
import { authRouter } from "./routes/auth.routes";
import { listingsRouter } from "./routes/listings.routes";
import { paymentsRouter } from "./routes/payments.routes";
import { walletRouter } from "./routes/wallet.routes";
import { adminRouter } from "./routes/admin.routes";
import { errorHandler } from "./middleware/errorHandler";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

// ─── Security ────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      const configuredOrigins = (process.env.CORS_ORIGINS ?? "")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      const allowed = new Set([
        "https://jefflinkcars.com",
        "https://www.jefflinkcars.com",
        "https://admin.jefflinkcars.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8081",
        ...configuredOrigins,
      ]);
      if (!origin || allowed.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin '${origin}' not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch {
    res.status(503).json({ status: "error", db: "disconnected" });
  }
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use("/auth",     authRouter(pool));
app.use("/listings", listingsRouter(pool));
app.use("/payments", paymentsRouter(pool));
app.use("/wallet",   walletRouter(pool));
app.use("/admin",    adminRouter(pool));

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: "not_found" }));

// ─── Global error handler ────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Bootstrap ───────────────────────────────────────────────────────────────
void (async () => {
  await checkDbConnection();
  app.listen(PORT, () => {
    console.log(`✓ JeffLink API listening on :${PORT}`);
  });
})();
