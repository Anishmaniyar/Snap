import pino from "pino";
import { Writable } from "node:stream";
import request from "supertest";
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import logger, { redactOptions } from "../src/lib/logger.js";
import {
  app,
  authHeader,
  cleanDatabase,
  db,
  signupUser,
  uniqueEmail,
  verifyTestConnection,
} from "./helpers.js";

beforeAll(async () => {
  await verifyTestConnection();
});

beforeEach(async () => {
  await cleanDatabase();
});

afterEach(() => {
  vi.restoreAllMocks();
});

type LogCall = [Record<string, unknown>, string];

const infoCallsWith = (
  infoSpy: ReturnType<typeof vi.spyOn>,
  msg: RegExp,
): LogCall[] =>
  infoSpy.mock.calls.filter((call: [unknown, unknown]) =>
    msg.test(String(call[1])),
  ) as LogCall[];

describe("logging: Pino redaction of sensitive values", () => {
  it("censors dummy secrets in real Pino output while leaving safe fields visible", async () => {
    let chunks = "";
    const stream = new Writable({
      write(chunk, _encoding, callback) {
        chunks += chunk.toString();
        callback();
      },
    });
    const testLogger = pino(
      {
        level: "info",
        redact: {
          paths: [...redactOptions.paths],
          censor: "[REDACTED]",
        },
      },
      stream,
    );

    testLogger.info(
      {
        password: "dummy-password-1",
        passwordHash: "dummy-hash-1",
        accessToken: "dummy-access-1",
        refreshToken: "dummy-refresh-1",
        token: "dummy-token-1",
        secret: "dummy-secret-1",
        otp: "dummy-otp-1",
        authorization: "Bearer dummy-auth-1",
        cookie: "dummy-cookie-1",
        credentials: { password: "dummy-nested-password-1" },
        email: "visible@example.com",
      },
      "redaction probe",
    );
    await new Promise((resolve) => setImmediate(resolve));

    for (const secret of [
      "dummy-password-1",
      "dummy-hash-1",
      "dummy-access-1",
      "dummy-refresh-1",
      "dummy-token-1",
      "dummy-secret-1",
      "dummy-otp-1",
      "dummy-auth-1",
      "dummy-cookie-1",
      "dummy-nested-password-1",
    ]) {
      expect(chunks).not.toContain(secret);
    }
    expect(chunks.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(10);
    // Non-sensitive metadata stays observable.
    expect(chunks).toContain("visible@example.com");
  });
});

describe("logging: auth business events", () => {
  it("logs user registration once with userId only", async () => {
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});
    const email = uniqueEmail();

    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Log Probe",
      email,
      password: "password123",
    });
    expect(res.status).toBe(201);

    const calls = infoCallsWith(infoSpy, /registered successfully/i);
    expect(calls).toHaveLength(1);
    const [obj] = calls[0] as LogCall;
    expect(typeof obj.userId).toBe("string");
    const text = JSON.stringify(calls);
    expect(text).not.toContain("password123");
    expect(text).not.toContain(email);
    expect(text).not.toContain(res.body.data.accessToken);
  });

  it("logs successful login with userId only", async () => {
    const user = await signupUser();
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: user.password,
    });
    expect(res.status).toBe(200);

    const calls = infoCallsWith(infoSpy, /logged in successfully/i);
    expect(calls).toHaveLength(1);
    expect((calls[0] as LogCall)[0].userId).toBe(user.id);
    expect(JSON.stringify(calls)).not.toContain(user.password);
  });

  it("warns on wrong-password login without logging the submitted password", async () => {
    const user = await signupUser();
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "wrongpassword1",
    });
    expect(res.status).toBe(401);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [obj, message] = warnSpy.mock.calls[0] as LogCall;
    expect(message).toMatch(/login failed/i);
    expect(obj.reason).toBe("invalid_password");
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(
      "wrongpassword1",
    );
    // No misleading success log.
    expect(infoCallsWith(infoSpy, /logged in successfully/i)).toHaveLength(0);
  });

  it("warns on unknown-account login without logging the submitted email", async () => {
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});
    const email = uniqueEmail();

    const res = await request(app).post("/api/v1/auth/login").send({
      email,
      password: "password123",
    });
    expect(res.status).toBe(401);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(email);
  });

  it("does not log a success event for duplicate-email signup", async () => {
    const email = uniqueEmail();
    await signupUser({ email });
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Someone Else",
      email,
      password: "password123",
    });
    expect(res.status).toBe(409);
    expect(infoCallsWith(infoSpy, /registered successfully/i)).toHaveLength(0);
  });
});

describe("logging: url business events", () => {
  it("logs custom-alias creation without the original URL value", async () => {
    const user = await signupUser();
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({
        originalUrl: "https://example.com/log-probe-custom",
        customAlias: "LOGPRB01",
      });
    expect(res.status).toBe(201);

    const calls = infoCallsWith(infoSpy, /custom alias/i);
    expect(calls).toHaveLength(1);
    const [obj] = calls[0] as LogCall;
    expect(obj.userId).toBe(user.id);
    expect(typeof obj.urlId).toBe("string");
    expect(JSON.stringify(calls)).not.toContain(
      "https://example.com/log-probe-custom",
    );
  });

  it("logs generated-code creation without the original URL value", async () => {
    const user = await signupUser();
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/log-probe-generated" });
    expect(res.status).toBe(201);

    const calls = infoCallsWith(infoSpy, /generated code/i);
    expect(calls).toHaveLength(1);
    expect(JSON.stringify(calls)).not.toContain(
      "https://example.com/log-probe-generated",
    );
  });

  it("logs updates with field names only and deletions with ids only", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/log-probe-update",
        shortCode: "LOGPRB02",
        userId: user.id,
      },
    });
    const infoSpy = vi.spyOn(logger, "info").mockImplementation(() => {});

    const patched = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/log-probe-updated" });
    expect(patched.status).toBe(200);

    // Filter by exact service message (request-logger uses "HTTP request").
    const serviceUpdates = infoSpy.mock.calls.filter(
      ([, message]) => message === "Short URL updated",
    ) as LogCall[];
    expect(serviceUpdates).toHaveLength(1);
    const [updateObj] = serviceUpdates[0] as LogCall;
    expect(updateObj.updatedFields).toEqual(["originalUrl"]);
    expect(JSON.stringify(serviceUpdates)).not.toContain(
      "https://example.com/log-probe-updated",
    );

    const deleted = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(deleted.status).toBe(204);

    const deleteCalls = infoSpy.mock.calls.filter(
      ([, message]) => message === "Short URL deletion completed",
    ) as LogCall[];
    expect(deleteCalls).toHaveLength(1);
    const [deleteObj] = deleteCalls[0] as LogCall;
    expect(deleteObj).toMatchObject({
      userId: user.id,
      urlId: created.id,
    });
  });
});

describe("logging: validation and error paths", () => {
  it("warns on validation failure with path only (query secrets never logged)", async () => {
    const warnSpy = vi.spyOn(logger, "warn").mockImplementation(() => {});

    const res = await request(app)
      .post("/api/v1/auth/signup?token=super-secret-value&next=/x")
      .send({ name: "Bad", email: "not-an-email", password: "password123" });
    expect(res.status).toBe(400);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const [obj, message] = warnSpy.mock.calls[0] as LogCall;
    expect(message).toMatch(/validation failed/i);
    // Router-relative path (same convention as the request logger) and,
    // critically, no query string.
    expect(obj.path).toBe("/signup");
    expect(String(obj.path)).not.toContain("?");
    expect(String(obj.path)).not.toContain("token");
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(
      "super-secret-value",
    );
  });

  it("logs an unexpected failure exactly once via the global handler", async () => {
    const user = await signupUser();
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});
    vi.spyOn(db.url, "create").mockRejectedValueOnce(
      new Error("boom-logging-probe"),
    );

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/log-probe-boom" });
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message: "Something went very wrong!",
    });

    // Single owner (global handler) — no per-layer duplicate.
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it("does not error-log expected redirect failures", async () => {
    const errorSpy = vi.spyOn(logger, "error").mockImplementation(() => {});

    const res = await request(app).get("/NOPE99").redirects(0);
    expect(res.status).toBe(404);
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
