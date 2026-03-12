import type { Request, Response, NextFunction } from "express";

export type Role =
  | "SYSTEM_ADMIN"
  | "DIRECTOR"
  | "FINANCE_OFFICER"
  | "RECOVERY_AGENT"
  | "BRANCH_OFFICER"
  | "VENDOR"
  | "BUYER"
  | "SELLER";

export interface AuthClaims {
  sub: string;
  role: Role;
  branchId?: string;
}

declare module "express-serve-static-core" {
  interface Request {
    auth?: AuthClaims;
  }
}

export const requireRole = (allowed: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.auth?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({ error: "forbidden" });
    }
    return next();
  };
};

export const requireBranchMatch = (branchIdParam: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const tokenBranch = req.auth?.branchId;
    if (tokenBranch && req.params[branchIdParam] !== tokenBranch) {
      return res.status(403).json({ error: "branch_forbidden" });
    }
    return next();
  };
};
