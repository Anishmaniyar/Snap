import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  app,
  cleanDatabase,
  db,
  signupUser,
  verifyTestConnection,
} from "./helpers.js";

beforeAll(async () => {
  await verifyTestConnection();
});

beforeEach(async () => {
  await cleanDatabase();
});

describe("GET /:shortCode", () => {
  it("redirects an active, unexpired URL with 302 and Location (no auth)", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/target",
        shortCode: "RED001",
        userId: user.id,
      },
    });
    void created;

    // No Authorization header: redirects are public.
    const res = await request(app).get("/RED001").redirects(0);

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://example.com/target");
  });

  it("returns 404 for an unknown shortcode", async () => {
    const res = await request(app).get("/NOPE99").redirects(0);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/not found/i);
  });

  it("returns 410 for an expired URL", async () => {
    const user = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/old",
        shortCode: "EXP001",
        userId: user.id,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const res = await request(app).get("/EXP001").redirects(0);
    expect(res.status).toBe(410);
    expect(res.body.message).toMatch(/expired/i);
  });

  it("returns 404 for an inactive URL", async () => {
    const user = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/off",
        shortCode: "INA001",
        userId: user.id,
        isActive: false,
      },
    });

    const res = await request(app).get("/INA001").redirects(0);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/inactive/i);
  });

  it("prefers inactive (404) when a URL is both inactive and expired", async () => {
    const user = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/both",
        shortCode: "BOTH01",
        userId: user.id,
        isActive: false,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const res = await request(app).get("/BOTH01").redirects(0);
    expect(res.status).toBe(404);
    expect(res.body.message).toMatch(/inactive/i);
  });
});
