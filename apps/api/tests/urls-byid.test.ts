import { randomUUID } from "node:crypto";
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

describe("GET /api/v1/urls/:id", () => {
  it("lets the owner fetch their URL as a flat object with shortUrl", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/mine",
        shortCode: "BYID01",
        userId: user.id,
      },
    });

    const res = await request(app)
      .get(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    const data = res.body.data;
    expect(data.id).toBe(created.id);
    expect(data.originalUrl).toBe("https://example.com/mine");
    expect(data.shortCode).toBe("BYID01");
    // Flat shape: shortUrl lives at the same level, not nested.
    expect(data.shortUrl).toBe(expectedShortUrl("BYID01"));
    expect(data.url).toBeUndefined();
  });

  it("rejects an invalid id with 400", async () => {
    const user = await signupUser();
    const res = await request(app)
      .get("/api/v1/urls/not-a-uuid")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(400);
  });

  it("returns 404 for a missing record", async () => {
    const user = await signupUser();
    const res = await request(app)
      .get(`/api/v1/urls/${randomUUID()}`)
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(404);
  });

  it("does not expose another user's URL (404)", async () => {
    const userA = await signupUser();
    const userB = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/private",
        shortCode: "BYID02",
        userId: userA.id,
      },
    });

    const res = await request(app)
      .get(`/api/v1/urls/${created.id}`)
      .set(authHeader(userB.accessToken));
    expect(res.status).toBe(404);
  });

  it("returns 404 for an inactive URL", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/retired",
        shortCode: "BYID03",
        userId: user.id,
        isActive: false,
      },
    });

    const res = await request(app)
      .get(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(404);
  });

  // Expiration affects redirection, not management visibility: the owner
  // can still retrieve an expired URL by id.
  it("allows the owner to retrieve an expired URL by id", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/stale",
        shortCode: "BYID04",
        userId: user.id,
        expiresAt: new Date(Date.now() - 60_000),
      },
    });

    const res = await request(app)
      .get(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id: created.id });
  });

  it("rejects unauthenticated access with 401", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/mine",
        shortCode: "BYID05",
        userId: user.id,
      },
    });
    const res = await request(app).get(`/api/v1/urls/${created.id}`);
    expect(res.status).toBe(401);
  });
});
