// Runs before every test file. Fails fast unless a dedicated test database
// is configured, so destructive cleanup can never hit dev/prod data.
import { assertTestDatabase } from "./helpers.js";

assertTestDatabase();
