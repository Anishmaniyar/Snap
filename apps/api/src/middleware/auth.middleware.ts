import type { Request, Response, NextFunction } from "express";

// TODO: extract Bearer access token, verify it, attach user info to req, 401 if missing/invalid.
// NOTE: public routes (GET /:shortCode, /health, /api/v1/auth/*) must NOT use this middleware.
export function requireAuth(_req: Request, _res: Response, _next: NextFunction): void {
  throw new Error("TODO: implement requireAuth");
}
