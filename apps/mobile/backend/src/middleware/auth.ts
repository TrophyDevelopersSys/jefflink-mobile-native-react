import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthClaims } from "./rbac";

const getToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header) return null;
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: "jwt_secret_missing" });
    }
    const decoded = jwt.verify(token, secret) as AuthClaims;
    req.auth = decoded;
    return next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
};
