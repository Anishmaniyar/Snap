import type { Request, Response } from "express";

// TODO: return a consistent 404 JSON body for unmatched routes.
export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not Found" });
}
