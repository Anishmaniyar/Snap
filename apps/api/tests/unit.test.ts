import { describe, expect, it } from "vitest";
import { generateShortCode } from "../src/modules/url/url.code.js";
import AppError from "../src/errors/app-error.js";

describe("generateShortCode (unit)", () => {
  it("produces fixed-length base62 codes", async () => {
    for (let i = 0; i < 50; i++) {
      const code = generateShortCode();
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[0-9A-Za-z]{6}$/);
    }
  });

  it("produces varied output across calls", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 100; i++) {
      codes.add(generateShortCode());
    }
    // 6-char base62 space (~57B); 100 draws colliding is ~1e-13.
    expect(codes.size).toBeGreaterThan(90);
  });
});

describe("AppError (unit)", () => {
  it("marks 4xx errors as fail and operational", () => {
    const err = new AppError("Not found", 404);
    expect(err.statusCode).toBe(404);
    expect(err.status).toBe("fail");
    expect(err.isOperational).toBe(true);
  });

  it("marks 5xx errors as error and operational", () => {
    const err = new AppError("Broken", 500);
    expect(err.statusCode).toBe(500);
    expect(err.status).toBe("error");
    expect(err.isOperational).toBe(true);
  });
});
