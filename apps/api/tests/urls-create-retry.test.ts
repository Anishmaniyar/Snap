import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  app,
  authHeader,
  cleanDatabase,
  db,
  expectedShortUrl,
  signupUser,
  verifyTestConnection,
} from "./helpers.js";

// Collision coverage without touching production code: the service retries
// whenever the INSERT fails with a P2002 unique-violation (duck-typed by
// `code`). We inject that exact signal at the Prisma seam — the shared `db`
// instance the repositories use — while everything else (HTTP, service,
// real INSERTs, real database) stays genuine.
const uniqueViolation = (): Error =>
  Object.assign(new Error("Unique constraint failed on the fields: `shortCode`"), {
    code: "P2002",
  });

beforeAll(async () => {
  await verifyTestConnection();
});

beforeEach(async () => {
  await cleanDatabase();
  vi.restoreAllMocks();
});

describe("POST /api/v1/urls shortcode collisions", () => {
  it("retries with a fresh code after a collision", async () => {
    const user = await signupUser();
    const createSpy = vi
      .spyOn(db.url, "create")
      .mockRejectedValueOnce(uniqueViolation());

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/retry" });

    expect(res.status).toBe(201);
    expect(createSpy).toHaveBeenCalledTimes(2);
    const shortCode = res.body.data.shortCode as string;
    expect(res.body.data.shortUrl).toBe(expectedShortUrl(shortCode));
    const persisted = await db.url.findUnique({ where: { shortCode } });
    expect(persisted?.userId).toBe(user.id);
    expect(persisted?.originalUrl).toBe("https://example.com/retry");
  });

  it("returns 500 after exhausting retries on repeated collisions", async () => {
    const user = await signupUser();
    const createSpy = vi
      .spyOn(db.url, "create")
      .mockRejectedValue(uniqueViolation());

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/exhausted" });

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/failed to generate unique short code/i);
    expect(createSpy).toHaveBeenCalledTimes(5);
  });

  it("does not retry non-collision database errors", async () => {
    const user = await signupUser();
    const createSpy = vi
      .spyOn(db.url, "create")
      .mockRejectedValueOnce(new Error("boom-transient"));

    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/fail-fast" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      status: "error",
      message: "Something went very wrong!",
    });
    // A generic failure aborts immediately instead of consuming retries.
    expect(createSpy).toHaveBeenCalledTimes(1);
  });
});
