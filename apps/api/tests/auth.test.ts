import request from "supertest";
import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  app,
  assertNoSensitiveLeak,
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

describe("POST /api/v1/auth/signup", () => {
  it("registers a user with 201 and returns safe user plus tokens", async () => {
    const email = uniqueEmail();
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Ada Lovelace",
      email,
      password: "password123",
    });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user).toMatchObject({ name: "Ada Lovelace", email });
    expect(typeof res.body.data.user.id).toBe("string");
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(typeof res.body.data.refreshToken).toBe("string");
    expect(res.body.data.accessToken.length).toBeGreaterThan(0);
    expect(res.body.data.refreshToken.length).toBeGreaterThan(0);
    assertNoSensitiveLeak(res);

    const persisted = await db.user.findUnique({ where: { email } });
    expect(persisted).not.toBeNull();
    expect(persisted?.passwordHash).not.toBe("password123");
  });

  it("returns 409 for a duplicate email", async () => {
    const email = uniqueEmail();
    await signupUser({ email });
    const res = await request(app).post("/api/v1/auth/signup").send({
      name: "Someone Else",
      email,
      password: "password123",
    });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/already registered/i);
    assertNoSensitiveLeak(res);
  });

  it("rejects invalid signup payloads with 400", async () => {
    const cases = [
      { name: "", email: uniqueEmail(), password: "password123" },
      { email: uniqueEmail(), password: "password123" },
      { name: "No Email", email: "not-an-email", password: "password123" },
      { name: "Short Pw", email: uniqueEmail(), password: "short" },
      { name: "No Pw", email: uniqueEmail() },
    ];
    for (const body of cases) {
      const res = await request(app).post("/api/v1/auth/signup").send(body);
      expect(res.status).toBe(400);
      assertNoSensitiveLeak(res);
    }
  });
});

describe("POST /api/v1/auth/login", () => {
  it("logs in with valid credentials and returns tokens", async () => {
    const user = await signupUser();
    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: user.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.user).toMatchObject({
      id: user.id,
      email: user.email,
    });
    expect(typeof res.body.data.accessToken).toBe("string");
    expect(typeof res.body.data.refreshToken).toBe("string");
    assertNoSensitiveLeak(res);
  });

  it("returns 401 for a wrong password without leaking details", async () => {
    const user = await signupUser();
    const res = await request(app).post("/api/v1/auth/login").send({
      email: user.email,
      password: "wrongpassword1",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
    assertNoSensitiveLeak(res);
  });

  it("returns 401 for an unknown email", async () => {
    const res = await request(app).post("/api/v1/auth/login").send({
      email: uniqueEmail("ghost"),
      password: "password123",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/invalid email or password/i);
    assertNoSensitiveLeak(res);
  });

  it("rejects invalid login payloads with 400", async () => {
    const res1 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: "not-an-email", password: "password123" });
    expect(res1.status).toBe(400);

    const res2 = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: uniqueEmail(), password: "short" });
    expect(res2.status).toBe(400);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("returns 200 with a logout message (stateless contract)", async () => {
    const res = await request(app).post("/api/v1/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.message).toMatch(/logged out/i);
    assertNoSensitiveLeak(res);
  });
});

describe("protected-route access", () => {
  it("rejects missing tokens with 401", async () => {
    const res = await request(app).get("/api/v1/urls");
    expect(res.status).toBe(401);
  });

  it("rejects malformed and invalid tokens with 401", async () => {
    const noBearer = await request(app)
      .get("/api/v1/urls")
      .set("Authorization", "Token abc.def.ghi");
    expect(noBearer.status).toBe(401);

    const garbage = await request(app)
      .get("/api/v1/urls")
      .set(authHeader("this.is.not.a.valid.token"));
    expect(garbage.status).toBe(401);
  });

  it("rejects tokens for users that no longer exist", async () => {
    const user = await signupUser();
    await db.user.delete({ where: { id: user.id } });
    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(401);
  });

  it("allows a valid token", async () => {
    const user = await signupUser();
    const res = await request(app)
      .get("/api/v1/urls")
      .set(authHeader(user.accessToken));
    expect(res.status).toBe(200);
  });
});
