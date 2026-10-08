import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
// Shared database client for all workspace consumers (apps/api imports this).
// TODO: use a singleton safe for dev hot-reload vs production lifecycle.
// NOTE: run `pnpm db:generate` after editing prisma/schema.prisma.
// Prisma 7 requires a driver adapter; DATABASE_URL is read here for the
// runtime connection, while prisma.config.ts provides it to the CLI.
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
});
export const db = new PrismaClient({ adapter });
//# sourceMappingURL=client.js.map