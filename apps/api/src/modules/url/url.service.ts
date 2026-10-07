// TODO: URL business logic (uses url.repository for persistence):
// - create: no alias -> random number -> Base62 -> shortCode, retry on UNIQUE collision;
//           custom alias -> validate, use as shortCode, 409 if taken.
// - resolve: lookup by shortCode -> 404 if missing/inactive, 410 if expired.
// - list/get/update/delete: ownership checks (URL.userId === req user id).
// Keep Base62 encode/decode as small functions in this file (no extra util module).
export {};
