import type { Request, Response, NextFunction } from "express";
import logger from "../lib/logger.js";
import AppError from "../errors/app-error.js";

// Converts thrown errors into JSON responses, hiding non-operational error details.
export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;

  const statusCode = isAppError ? err.statusCode : 500;
  const status = isAppError ? err.status : "error";

  if (!isAppError) {
    logger.error(
      {
        requestId: res.locals.requestId,
        method: req.method,
        path: req.path,
        statusCode,
        err,
      },
      "Unexpected error while handling HTTP request",
    );
  }

  return res.status(statusCode).json({
    status,
    message: isAppError ? err.message : "Something went very wrong!",
  });
};
