import { PrismaClient } from "@prisma/client";

// Shared database client for all workspace consumers (apps/api imports this).
// TODO: use a singleton safe for dev hot-reload vs production lifecycle.
// NOTE: run `pnpm db:generate` after editing prisma/schema.prisma.
export const db = new PrismaClient();
