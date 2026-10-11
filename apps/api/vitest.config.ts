import { config as loadEnv } from "dotenv";
import { defineConfig } from "vitest/config";

// Load the dedicated test environment before any test file (or the app
// under test) reads process.env. dotenv never overrides already-set vars,
// so CI can still inject DATABASE_URL directly.
loadEnv({ path: ".env.test" });

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    // Never run stale compiled output (dist/) as tests.
    exclude: ["node_modules", "dist", "**/dist/**"],
    setupFiles: ["./tests/setup.ts"],
    pool: "forks",
    // All files share one PostgreSQL test database, so files must run
    // sequentially; per-test isolation comes from unique users plus
    // beforeEach cleanup (see tests/helpers.ts).
    fileParallelism: false,
    testTimeout: 30_000,
  },
});
