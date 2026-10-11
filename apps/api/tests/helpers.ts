import request from "supertest";
import type { Response } from "supertest";
import { randomUUID } from "node:crypto";
import { expect } from "vitest";
import { db } from "@snap/database";
import app from "../src/app.js";
import { config } from "../src/config/config.env.js";

export { app, db, config };

export const getDatabaseUrl = (): string => process.env.DATABASE_URL ?? "";

/**
 * Safety guard: tests perform destructive cleanup (deleteMany), so they must
 * only ever run against a dedicated test database. Fails fast otherwise.
 */
export const assertTestDatabase = (): void => {
  const url = getDatabaseUrl();
  if (!/test/i.test(url)) {
    const masked = url.replace(/:[^:@/]+@/, ":***@");
    throw new Error(
      `Refusing to run tests: DATABASE_URL does not look like a test database (got "${masked}"). ` +
        `Set DATABASE_URL to your dedicated test database (e.g. .../snap_test).`,
    );
  }
};

export const verifyTestConnection = async (): Promise<void> => {
  assertTestDatabase();
  await db.$queryRaw`SELECT 1`;
};

export const cleanDatabase = async (): Promise<void> => {
  assertTestDatabase();
  await db.url.deleteMany({});
  await db.user.deleteMany({});
};

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  accessToken: string;
  refreshToken: string;
}

export const uniqueEmail = (prefix = "user"): string =>
  `${prefix}-${randomUUID()}@example.com`;

export const signupUser = async (overrides: {
  name?: string;
  email?: string;
  password?: string;
} = {}): Promise<TestUser> => {
  const name = overrides.name ?? "Test User";
  const email = overrides.email ?? uniqueEmail();
  const password = overrides.password ?? "password123";
  const res = await request(app)
    .post("/api/v1/auth/signup")
    .send({ name, email, password });
  if (res.status !== 201) {
    throw new Error(
      `signup helper failed: ${res.status} ${JSON.stringify(res.body)}`,
    );
  }
  const data = res.body.data as {
    user: { id: string };
    accessToken: string;
    refreshToken: string;
  };
  return {
    id: data.user.id,
    name,
    email,
    password,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
};

export const authHeader = (token: string): { Authorization: string } => ({
  Authorization: `Bearer ${token}`,
});

export const expectedShortUrl = (shortCode: string): string =>
  `${config.app.baseUrl}/${shortCode}`;

export const responseText = (res: Response): string => JSON.stringify(res.body);

export const assertNoSensitiveLeak = (res: Response): void => {
  const text = responseText(res).toLowerCase();
  expect(text).not.toContain("passwordhash");
  // "password" may legitimately appear inside messages; check keys instead.
  const body = res.body as unknown;
  const seen: string[] = [];
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (value !== null && typeof value === "object") {
      for (const [key, val] of Object.entries(value)) {
        seen.push(key.toLowerCase());
        walk(val);
      }
    }
  };
  walk(body);
  expect(seen).not.toContain("password");
  expect(seen).not.toContain("passwordhash");
};
