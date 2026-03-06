import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Pool } from "pg";
import { requireAuth } from "../middleware/auth";
import type { AuthClaims } from "../middleware/rbac";

type UserRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  status: string;
  branch_id: string | null;
  password_hash: string | null;
  role: string;
};

function makeJwt(user: Omit<UserRow, "password_hash">): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  const payload: AuthClaims & { email: string; name: string } = {
    sub: user.id,
    email: user.email,
    name: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    role: user.role as AuthClaims["role"],
    ...(user.branch_id ? { branchId: user.branch_id } : {}),
  };
  return jwt.sign(payload, secret, {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"],
  });
}

function formatUser(user: Omit<UserRow, "password_hash">) {
  return {
    id: user.id,
    email: user.email,
    fullName: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim(),
    role: user.role,
    status: user.status.toLowerCase(),
  };
}

export function authRouter(pool: Pool): Router {
  const router = Router();

  /* POST /auth/login */
  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await pool.query<UserRow>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.status,
                u.branch_id, u.password_hash, r.name AS role
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.email = $1`,
        [email.toLowerCase().trim()]
      );

      const user = result.rows[0];
      if (!user?.password_hash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.status !== "ACTIVE") {
        return res.status(403).json({ message: "Account suspended" });
      }

      const token = makeJwt(user);
      return res.json({ token, user: formatUser(user) });
    } catch (err) {
      return next(err);
    }
  });

  /* POST /auth/register */
  router.post("/register", async (req, res, next) => {
    try {
      const { fullName, email, password, role = "CUSTOMER" } = req.body as {
        fullName?: string;
        email?: string;
        password?: string;
        role?: string;
      };

      if (!fullName || !email || !password) {
        return res.status(400).json({ message: "fullName, email and password are required" });
      }
      if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const existing = await pool.query<{ id: string }>(
        "SELECT id FROM users WHERE email = $1",
        [normalizedEmail]
      );
      if ((existing.rowCount ?? 0) > 0) {
        return res.status(409).json({ message: "Email already registered" });
      }

      const roleResult = await pool.query<{ id: string }>(
        "SELECT id FROM roles WHERE name = $1",
        [role.toUpperCase()]
      );
      if ((roleResult.rowCount ?? 0) === 0) {
        return res.status(400).json({ message: `Unknown role: ${role}` });
      }
      const roleId = roleResult.rows[0].id;

      const [firstName, ...rest] = fullName.trim().split(" ");
      const lastName = rest.join(" ") || null;
      const passwordHash = await bcrypt.hash(password, 12);

      const insert = await pool.query<{ id: string; status: string }>(
        `INSERT INTO users (role_id, first_name, last_name, email, password_hash, status)
         VALUES ($1, $2, $3, $4, $5, 'ACTIVE')
         RETURNING id, status`,
        [roleId, firstName, lastName, normalizedEmail, passwordHash]
      );

      const newUser = insert.rows[0];
      const userForToken: Omit<UserRow, "password_hash"> = {
        id: newUser.id,
        email: normalizedEmail,
        first_name: firstName,
        last_name: lastName,
        status: "ACTIVE",
        branch_id: null,
        role: role.toUpperCase(),
      };

      const token = makeJwt(userForToken);
      return res.status(201).json({ token, user: formatUser(userForToken) });
    } catch (err) {
      return next(err);
    }
  });

  /* GET /auth/me */
  router.get("/me", requireAuth, async (req, res, next) => {
    try {
      const result = await pool.query<Omit<UserRow, "password_hash">>(
        `SELECT u.id, u.email, u.first_name, u.last_name, u.status,
                u.branch_id, r.name AS role
         FROM users u
         JOIN roles r ON r.id = u.role_id
         WHERE u.id = $1`,
        [req.auth!.sub]
      );

      const user = result.rows[0];
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json(formatUser(user));
    } catch (err) {
      return next(err);
    }
  });

  return router;
}
