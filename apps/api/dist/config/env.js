import { z } from "zod";
// TODO: define + validate required env vars with Zod. Fail fast on missing/invalid.
// Expected: PORT, DATABASE_URL, JWT_ACCESS_SECRET, JWT_REFRESH_SECRET,
// FRONTEND_ORIGIN (CORS). REDIS_URL only when Redis is introduced.
// TODO: export a typed config object. App code must import this, never process.env directly.
export {};
//# sourceMappingURL=env.js.map