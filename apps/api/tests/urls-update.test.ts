import { randomUUID } from "node:crypto";
import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  app,
  authHeader,
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

describe("PATCH /api/v1/urls/:id", () => {
  it("persists a valid originalUrl update", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD001",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/after" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.originalUrl).toBe("https://example.com/after");
  });

  it("rejects an invalid originalUrl with 400 and leaves the record unchanged", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD002",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "not-a-url" });

    expect(res.status).toBe(400);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.originalUrl).toBe("https://example.com/before");
  });

  it("rejects an empty body with 400 and leaves the record unchanged", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD003",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({});

    expect(res.status).toBe(400);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.originalUrl).toBe("https://example.com/before");
  });

  it("ignores unsupported fields such as shortCode", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD004",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/after", shortCode: "HACKED" });

    expect(res.status).toBe(200);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.shortCode).toBe("UPD004");
    expect(persisted?.originalUrl).toBe("https://example.com/after");
  });

  it("prevents another user from updating the record (404)", async () => {
    const userA = await signupUser();
    const userB = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD005",
        userId: userA.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(userB.accessToken))
      .send({ originalUrl: "https://example.com/hacked" });

    expect(res.status).toBe(404);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.originalUrl).toBe("https://example.com/before");
  });

  it("returns 404 for a missing record", async () => {
    const user = await signupUser();
    const res = await request(app)
      .patch(`/api/v1/urls/${randomUUID()}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/x" });
    expect(res.status).toBe(404);
  });

  it("rejects an invalid id with 400", async () => {
    const user = await signupUser();
    const res = await request(app)
      .patch("/api/v1/urls/not-a-uuid")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/x" });
    expect(res.status).toBe(400);
  });

  it("keeps shortCode unchanged after an update", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD006",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/after" });

    expect(res.status).toBe(200);
    expect(res.body.data.shortCode).toBe("UPD006");
  });

  it("persists expiration updates", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD007",
        userId: user.id,
      },
    });
    const expiresAt = new Date(Date.now() + 86_400_000).toISOString();

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ expiresAt });

    expect(res.status).toBe(200);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.expiresAt?.getTime()).toBe(new Date(expiresAt).getTime());
  });

  // expiresAt is nullable in the Prisma schema (DateTime?), so clearing
  // via null fits the existing API design and is supported.
  it("clears expiry when expiresAt is null", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD008",
        userId: user.id,
        expiresAt: new Date(Date.now() + 86_400_000),
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ expiresAt: null });

    expect(res.status).toBe(200);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.expiresAt).toBeNull();
  });

  it("does not allow customAlias to modify the short code", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD010",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({
        originalUrl: "https://example.com/after",
        customAlias: "HACKED",
      });

    expect(res.status).toBe(200);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.shortCode).toBe("UPD010");
    expect(persisted?.originalUrl).toBe("https://example.com/after");
  });

  it("rejects unauthenticated updates with 401", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD009",
        userId: user.id,
      },
    });
    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .send({ originalUrl: "https://example.com/x" });
    expect(res.status).toBe(401);
  });

  it("rejects an invalid expiresAt with 400", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD011",
        userId: user.id,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ expiresAt: "not-a-date" });

    expect(res.status).toBe(400);
  });

  it("returns 404 when updating an inactive URL", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/before",
        shortCode: "UPD012",
        userId: user.id,
        isActive: false,
      },
    });

    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/after" });

    expect(res.status).toBe(404);
  });
});
