import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "test", "production"])
        .default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3000),
    // NOTE: named APP_BASE_URL (not BASE_URL) because the vitest/vite
    // toolchain reserves process.env.BASE_URL (always "/"), which dotenv
    // will not override and zod would reject.
    APP_BASE_URL: z.url().default("http://localhost:3000"),
    REDIS_URL: z.url(),
    DATABASE_URL: z.url(),
    JWT_ACCESS_SECRET: z
        .string()
        .min(1, { message: "JWT_ACCESS_SECRET is required" }),
    JWT_REFRESH_SECRET: z
        .string()
        .min(1, { message: "JWT_REFRESH_SECRET is required" }),
    LOG_LEVEL: z
        .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
        .default("info"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment configuration:");
    console.error(z.prettifyError(parsedEnv.error));
    process.exit(1);
}
const env = parsedEnv.data;
export const config = Object.freeze({
    env: env.NODE_ENV,
    server: Object.freeze({
        port: env.PORT,
    }),
    app: Object.freeze({
        baseUrl: env.APP_BASE_URL,
    }),
    database: Object.freeze({
        url: env.DATABASE_URL,
    }),
    auth: Object.freeze({
        accessSecret: env.JWT_ACCESS_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
    }),
    logging: Object.freeze({
        level: env.LOG_LEVEL,
    }),
});
//# sourceMappingURL=config.env.js.map