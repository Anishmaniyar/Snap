import request from "supertest";
import { describe, expect, it } from "vitest";
import { db } from "@snap/database";
import app from "./app.js";
describe("GET /health", () => {
    it("should return 200", async () => {
        const response = await request(app).get("/health");
        expect(response.status).toBe(200);
    });
});
describe("Database", () => {
    it("should connect to the database", async () => {
        const result = await db.$queryRaw `SELECT 1`;
        expect(result).toBeDefined();
    });
});
//# sourceMappingURL=app.test.js.map