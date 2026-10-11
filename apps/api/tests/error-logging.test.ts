import express from "express";
import request from "supertest";
import { afterEach, describe, expect, it, vi } from "vitest";
import { requestLogger } from "../src/middleware/request-logger.middleware.js";
import { globalErrorHandler } from "../src/middleware/error.middleware.js";
import logger from "../src/lib/logger.js";
import realApp from "../src/app.js";

// Safe regression coverage for the Pino error-logging path. This file
// builds its own isolated Express app from the REAL requestLogger and
// globalErrorHandler, so it exercises the production code path WITHOUT
// requiring (or introducing) any debug route in src/app.ts.
const buildIsolatedApp = (): express.Express => {
  const isolated = express();
  isolated.use(express.json());
  isolated.use(requestLogger);
  isolated.get("/__debug/error", () => {
    throw new Error("Temporary debug error for Pino logging verification");
  });
  isolated.use(globalErrorHandler);
  return isolated;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Pino unexpected-error logging (isolated app, real middlewares)", () => {
  it("logs requestId/method/path/500/message+stack, reuses the requestId in the completion log, and returns a generic 500", async () => {
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(buildIsolatedApp()).get("/__debug/error");

    // 7. Generic 500 response with no leak.
    expect(res.status).toBe(500);
    expect(res.body.status).toBe("error");
    expect(typeof res.body.message).toBe("string");
    const bodyText = JSON.stringify(res.body);
    expect(bodyText).not.toMatch(/stack|Temporary debug error/i);
    expect(res.body.stack).toBeUndefined();

    // 5. Error log contents.
    expect(errorSpy).toHaveBeenCalledTimes(1);
    const [loggedObj, loggedMsg] = errorSpy.mock.calls[0] as [
      Record<string, unknown>,
      string,
    ];
    expect(loggedMsg).toMatch(/unexpected error/i);
    expect(loggedObj.method).toBe("GET");
    expect(loggedObj.path).toBe("/__debug/error");
    expect(loggedObj.statusCode).toBe(500);
    expect(typeof loggedObj.requestId).toBe("string");
    expect(loggedObj.requestId).not.toBe("");
    const loggedErr = loggedObj.err as Error;
    expect(loggedErr).toBeInstanceOf(Error);
    expect(loggedErr.message).toMatch(/Temporary debug error/);
    expect(typeof loggedErr.stack).toBe("string");

    // Response carries the same request ID.
    const responseRequestId = res.headers["x-request-id"] as string;
    expect(responseRequestId).toBe(loggedObj.requestId);

    // 6. Request-completion log carries the SAME request ID.
    await new Promise((resolve) => setImmediate(resolve));
    const completionCalls = infoSpy.mock.calls.filter(
      ([obj]) =>
        (obj as Record<string, unknown>).requestId === loggedObj.requestId,
    );
    expect(completionCalls.length).toBeGreaterThanOrEqual(1);
    const [completionObj, completionMsg] = completionCalls[0] as [
      Record<string, unknown>,
      string,
    ];
    expect(completionMsg).toMatch(/http request/i);
    expect(completionObj.method).toBe("GET");
    expect(completionObj.path).toBe("/__debug/error");
    expect(completionObj.statusCode).toBe(500);
  });
});

describe("temporary debug endpoint gating (real app)", () => {
  it("is NOT exposed outside development (NODE_ENV=test here)", async () => {
    // The real app under test env must not serve the temporary endpoint.
    const res = await request(realApp).get("/__debug/error");
    expect(res.status).toBe(404);
  });
});
