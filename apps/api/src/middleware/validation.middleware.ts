import type { Request, Response, NextFunction } from "express";
import type { ZodType } from "zod";

// TODO: validate req[source] against schema; on success replace req[source] with parsed
// data; on failure forward a 400 validation error to the error middleware.
export function validate(_schema: ZodType, _source: "body" | "params" | "query" = "body") {
  return (_req: Request, _res: Response, _next: NextFunction): void => {
    throw new Error("TODO: implement validate");
  };
}
