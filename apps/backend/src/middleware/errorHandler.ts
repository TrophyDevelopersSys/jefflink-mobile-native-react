import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const message = error instanceof Error ? error.message : "internal_error";
  return res.status(500).json({ error: message });
};
