// TODO: extend logged fields as needed — requestId, userId (when available), error info.
// Never log passwords, tokens, cookies, secrets, or full request bodies.
import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;

    logger.info(
      {
        method: req.method,
        path: req.originalUrl,
        statusCode: res.statusCode,
        duration,
      },
      "HTTP request",
    );
  });

  next();
}
