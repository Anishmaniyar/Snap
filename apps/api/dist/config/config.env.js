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
    WORKER_CONCURRENCY: z.coerce.number().min(1).default(5),
    WORKER_ID: z.string().default("unknown-worker"),
    GLOBAL_CONCURRENCY: z.coerce.number().min(1).default(6),
    SCHEDULER_POOL_INTERVAL: z.coerce.number().min(5000).default(15000),
    SCHEDULER_BATCH_SIZE: z.coerce.number().min(5).default(5),
    SCHEDULER_ID: z.string().default("unknown-scheduler"),
    IDEMPOTENCY_PROCESSING_TIMEOUT_MS: z.coerce.number(),
    EXECUTION_TIMEOUT_MS: z.coerce.number().int().positive(),
    LEASE_DURATION_MS: z.coerce.number().int().positive().default(30000),
    HEARTBEAT_INTERVAL_MS: z.coerce.number().int().positive().default(10000),
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
});
//# sourceMappingURL=config.env.js.map