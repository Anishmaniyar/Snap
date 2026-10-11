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

describe("DELETE /api/v1/urls/:id", () => {
  it("lets the owner soft-delete an active URL with 204 and empty body", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/gone",
        shortCode: "DEL001",
        userId: user.id,
      },
    });

    const res = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));

    expect(res.status).toBe(204);
    expect(res.text).toBe("");

    const persisted = await db.url.findUnique({ where: { id: created.id } });
    // Soft delete: flipped to inactive, never physically removed.
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(false);
  });

  it("stops redirecting a deleted URL (404 inactive)", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/gone",
        shortCode: "DEL002",
        userId: user.id,
      },
    });

    const del = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(del.status).toBe(204);

    const redirect = await request(app).get("/DEL002").redirects(0);
    expect(redirect.status).toBe(404);
    expect(redirect.body.message).toMatch(/inactive/i);
  });

  it("prevents another user from deleting the URL (404, still active)", async () => {
    const userA = await signupUser();
    const userB = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/keep",
        shortCode: "DEL003",
        userId: userA.id,
      },
    });

    const res = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(userB.accessToken));

    expect(res.status).toBe(404);
    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted?.isActive).toBe(true);
  });

  it("returns 404 for a missing record", async () => {
    const user = await signupUser();
    const res = await request(app)
      .delete(`/api/v1/urls/${randomUUID()}`)
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(404);
  });

  it("rejects an invalid id with 400", async () => {
    const user = await signupUser();
    const res = await request(app)
      .delete("/api/v1/urls/not-a-uuid")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(400);
  });

  // Deleting an already-inactive URL returns 404 — the record is gone
  // from management visibility (soft-deleted, never physically removed).
  it("returns 404 when deleting an already-inactive URL", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/twice",
        shortCode: "DEL004",
        userId: user.id,
      },
    });

    const first = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(first.status).toBe(204);

    const second = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expect(second.status).toBe(404);

    const persisted = await db.url.findUnique({ where: { id: created.id } });
    expect(persisted).not.toBeNull();
    expect(persisted?.isActive).toBe(false);
  });

  it("rejects unauthenticated deletes with 401", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/keep",
        shortCode: "DEL005",
        userId: user.id,
      },
    });
    const res = await request(app).delete(`/api/v1/urls/${created.id}`);
    expect(res.status).toBe(401);
  });
});
