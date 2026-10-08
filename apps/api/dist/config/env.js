import "dotenv/config";
import { z } from "zod";
const envSchema = z.object({
    PORT: z.coerce.number().int().positive().default(3000),
    DATABASE_URL: z.string().min(1, { message: "DATABASE_URL is required" }),
    JWT_ACCESS_SECRET: z
        .string()
        .min(1, { message: "JWT_ACCESS_SECRET is required" }),
    JWT_REFRESH_SECRET: z
        .string()
        .min(1, { message: "JWT_REFRESH_SECRET is required" }),
    FRONTEND_ORIGIN: z.string().default("http://localhost:5173"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    const details = parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; ");
    throw new Error(`Invalid environment variables — ${details}`);
}
export const env = parsed.data;
//# sourceMappingURL=env.js.map