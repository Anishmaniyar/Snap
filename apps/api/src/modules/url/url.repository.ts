// TODO: Prisma queries via `db` from "@snap/database":
// findByShortCode (redirect: hot path, backed by UNIQUE index),
// findById, listByUserId (backed by @@index([userId])), create, update, delete.
// No HTTP logic, no business decisions (no collision retry here — service owns that).
export {};
