import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  app,
  assertNoSensitiveLeak,
  authHeader,
  cleanDatabase,
  config,
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

describe("POST /api/v1/urls", () => {
  it("creates a short URL for an authenticated user", async () => {
    const user = await signupUser();
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/some/page" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    const data = res.body.data;
    expect(data.originalUrl).toBe("https://example.com/some/page");
    expect(typeof data.shortCode).toBe("string");
    expect(data.shortCode.length).toBeGreaterThan(0);
    expect(data.userId).toBe(user.id);
    expect(data.shortUrl).toBe(expectedShortUrl(data.shortCode));
    expect(data.shortUrl).toBe(`${config.app.baseUrl}/${data.shortCode}`);
    assertNoSensitiveLeak(res);
  });

  it("persists the generated shortcode with the correct userId", async () => {
    const user = await signupUser();
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/persist" });

    expect(res.status).toBe(201);
    const persisted = await db.url.findUnique({
      where: { shortCode: res.body.data.shortCode },
    });
    expect(persisted).not.toBeNull();
    expect(persisted?.originalUrl).toBe("https://example.com/persist");
    expect(persisted?.userId).toBe(user.id);
    expect(persisted?.isActive).toBe(true);
    // shortUrl is derived at response time, not a stored column.
    expect(persisted).not.toHaveProperty("shortUrl");
  });

  it("stores a missing expiresAt as null", async () => {
    const user = await signupUser();
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/no-expiry" });

    expect(res.status).toBe(201);
    expect(res.body.data.expiresAt).toBeNull();
    const persisted = await db.url.findUnique({
      where: { id: res.body.data.id },
    });
    expect(persisted?.expiresAt).toBeNull();
  });

  it("persists a valid expiresAt", async () => {
    const user = await signupUser();
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/expiry", expiresAt });

    expect(res.status).toBe(201);
    const persisted = await db.url.findUnique({
      where: { id: res.body.data.id },
    });
    expect(persisted?.expiresAt).not.toBeNull();
    expect(persisted?.expiresAt?.getTime()).toBe(new Date(expiresAt).getTime());
  });

  it("rejects missing, empty, or invalid originalUrl with 400", async () => {
    const user = await signupUser();
    const headers = authHeader(user.accessToken);

    const missing = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({});
    expect(missing.status).toBe(400);

    const empty = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({ originalUrl: "" });
    expect(empty.status).toBe(400);

    const invalid = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({ originalUrl: "not-a-url" });
    expect(invalid.status).toBe(400);
  });

  it("rejects an invalid expiresAt with 400", async () => {
    const user = await signupUser();
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({
        originalUrl: "https://example.com/bad-expiry",
        expiresAt: "not-a-date",
      });
    expect(res.status).toBe(400);
  });

  it("rejects missing or invalid authentication with 401", async () => {
    const noAuth = await request(app)
      .post("/api/v1/urls")
      .send({ originalUrl: "https://example.com/x" });
    expect(noAuth.status).toBe(401);

    const badToken = await request(app)
      .post("/api/v1/urls")
      .set(authHeader("invalid.token.here"))
      .send({ originalUrl: "https://example.com/x" });
    expect(badToken.status).toBe(401);
  });

  it("returns 409 for a duplicate custom alias", async () => {
    const user = await signupUser();
    const headers = authHeader(user.accessToken);
    const first = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({
        originalUrl: "https://example.com/first",
        customAlias: "mydup",
      });
    expect(first.status).toBe(201);
    expect(first.body.data.shortCode).toBe("mydup");

    const second = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({
        originalUrl: "https://example.com/second",
        customAlias: "mydup",
      });
    expect(second.status).toBe(409);
    expect(second.body.message).toMatch(/already taken/i);
  });

  it("returns 409 when another user takes the same custom alias", async () => {
    const userA = await signupUser();
    const userB = await signupUser();
    const first = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(userA.accessToken))
      .send({
        originalUrl: "https://example.com/a",
        customAlias: "shared1",
      });
    expect(first.status).toBe(201);

    const second = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(userB.accessToken))
      .send({
        originalUrl: "https://example.com/b",
        customAlias: "shared1",
      });
    expect(second.status).toBe(409);
  });

  it("rejects invalid custom aliases with 400", async () => {
    const user = await signupUser();
    const headers = authHeader(user.accessToken);
    // too short (< 3)
    const short = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({ originalUrl: "https://example.com/x", customAlias: "ab" });
    expect(short.status).toBe(400);
    // too long (> 10)
    const long = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({
        originalUrl: "https://example.com/x",
        customAlias: "waytoolongalias",
      });
    expect(long.status).toBe(400);
    // illegal characters
    const badChars = await request(app)
      .post("/api/v1/urls")
      .set(headers)
      .send({
        originalUrl: "https://example.com/x",
        customAlias: "bad alias!",
      });
    expect(badChars.status).toBe(400);
  });
});
