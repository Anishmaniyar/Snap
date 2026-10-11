import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  app,
  authHeader,
  cleanDatabase,
  db,
  expectedShortUrl,
  signupUser,
  verifyTestConnection,
} from "./helpers.js";

beforeAll(async () => {
  await verifyTestConnection();
});

beforeEach(async () => {
  await cleanDatabase();
});

describe("GET /api/v1/urls", () => {
  it("returns the authenticated user's own URLs with derived shortUrl", async () => {
    const user = await signupUser();
    const first = await db.url.create({
      data: {
        originalUrl: "https://example.com/a",
        shortCode: "LST001",
        userId: user.id,
      },
    });
    const second = await db.url.create({
      data: {
        originalUrl: "https://example.com/b",
        shortCode: "LST002",
        userId: user.id,
      },
    });

    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(2);

    const codes = res.body.data.map(
      (u: { shortCode: string }) => u.shortCode,
    );
    expect(codes).toContain("LST001");
    expect(codes).toContain("LST002");
    for (const item of res.body.data as Array<{
      shortCode: string;
      shortUrl: string;
    }>) {
      expect(item.shortUrl).toBe(expectedShortUrl(item.shortCode));
    }
    // Items carry identifiers needed by clients.
    expect(res.body.data[0]).toHaveProperty("id", first.id);
    expect(res.body.data[1]).toHaveProperty("id", second.id);
  });

  it("returns 200 with an empty data array when the user has no URLs", async () => {
    const user = await signupUser();
    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });

  it("does not expose one user's URLs to another user", async () => {
    const userA = await signupUser();
    const userB = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/secret",
        shortCode: "LST003",
        userId: userA.id,
      },
    });

    const resB = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(userB.accessToken));
    expect(resB.status).toBe(200);
    expect(resB.body.data).toEqual([]);
  });

  it("keeps expired URLs in the list", async () => {
    const user = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/stale",
        shortCode: "LST004",
        userId: user.id,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({ shortCode: "LST004" });
  });

  it("excludes inactive URLs from the list", async () => {
    const user = await signupUser();
    await db.url.create({
      data: {
        originalUrl: "https://example.com/soft-deleted",
        shortCode: "LST005",
        userId: user.id,
        isActive: false,
      },
    });
    await db.url.create({
      data: {
        originalUrl: "https://example.com/active",
        shortCode: "LST006",
        userId: user.id,
      },
    });

    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0]).toMatchObject({
      shortCode: "LST006",
      isActive: true,
    });
  });

  it("rejects missing or invalid authentication with 401", async () => {
    const noAuth = await request(app).get("/api/v1/urls");
    expect(noAuth.status).toBe(401);

    const badToken = await request(app)
      .get("/api/v1/urls")
      .set(authHeader("invalid.token.here"));
    expect(badToken.status).toBe(401);
  });
});
