import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  app,
  authHeader,
  cleanDatabase,
  db,
  signupUser,
  verifyTestConnection,
} from "./helpers.js";

// Database-failure contract: any unexpected DB error must surface as a
// generic 500 without leaking internals. The failures are injected by
// spying on the shared Prisma client (the same instance the repositories
// use), so no production module needs to be mocked.
beforeAll(async () => {
  await verifyTestConnection();
});

beforeEach(async () => {
  await cleanDatabase();
  vi.restoreAllMocks();
});

const expectGeneric500 = (res: {
  status: number;
  body: unknown;
}): void => {
  expect(res.status).toBe(500);
  expect(res.body).toEqual({
    status: "error",
    message: "Something went very wrong!",
  });
  // Internal details must never leak.
  expect(JSON.stringify(res.body)).not.toMatch(/boom|prisma|stack|sql/i);
};

describe("database failure handling", () => {
  it("POST /api/v1/urls returns a generic 500 on DB failure", async () => {
    const user = await signupUser();
    vi.spyOn(db.url, "create").mockRejectedValueOnce(new Error("boom-create"));
    const res = await request(app)
      .post("/api/v1/urls")
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/fail" });
    expectGeneric500(res);
  });

  it("GET /:shortCode returns a generic 500 on DB failure", async () => {
    vi.spyOn(db.url, "findUnique").mockRejectedValueOnce(
      new Error("boom-redirect"),
    );
    const res = await request(app).get("/ZZZZZZ").redirects(0);
    expectGeneric500(res);
  });

  it("GET /api/v1/urls returns a generic 500 on DB failure", async () => {
    const user = await signupUser();
    vi.spyOn(db.url, "findMany").mockRejectedValueOnce(new Error("boom-list"));
    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));
    expectGeneric500(res);
  });

  it("GET /api/v1/urls/:id returns a generic 500 on DB failure", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/one",
        shortCode: "DBF001",
        userId: user.id,
      },
    });
    vi.spyOn(db.url, "findFirst").mockRejectedValueOnce(
      new Error("boom-byid"),
    );
    const res = await request(app)
      .get(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expectGeneric500(res);
  });

  it("PATCH /api/v1/urls/:id returns a generic 500 on DB failure", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/two",
        shortCode: "DBF002",
        userId: user.id,
      },
    });
    vi.spyOn(db.url, "update").mockRejectedValueOnce(new Error("boom-update"));
    const res = await request(app)
      .patch(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken))
      .send({ originalUrl: "https://example.com/updated" });
    expectGeneric500(res);
  });

  it("DELETE /api/v1/urls/:id returns a generic 500 on DB failure", async () => {
    const user = await signupUser();
    const created = await db.url.create({
      data: {
        originalUrl: "https://example.com/three",
        shortCode: "DBF003",
        userId: user.id,
      },
    });
    vi.spyOn(db.url, "update").mockRejectedValueOnce(new Error("boom-delete"));
    const res = await request(app)
      .delete(`/api/v1/urls/${created.id}`)
      .set(authHeader(user.accessToken));
    expectGeneric500(res);
  });
});
