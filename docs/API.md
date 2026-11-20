# API surface

Base prefix: `/api/v1`. JSON in and out. Authenticated routes need `Authorization: Bearer <accessToken>`.

| Method | Path | Auth | Body | Result |
| --- | --- | --- | --- | --- |
| POST | `/auth/signup` | no | `name`, `email`, `password` (8+) | 201, user + tokens |
| POST | `/auth/login` | no | `email`, `password` (8+) | 200, user + tokens |
| POST | `/auth/logout` | no | none | 200 message, no server state |
| POST | `/urls` | yes | `originalUrl`, optional `customAlias` (3-10), optional `expiresAt` (ISO) | 201, record + `shortUrl` |
| GET | `/urls` | yes | none | 200, active links for the user |
| GET | `/urls/:id` | yes | UUID param | 200, one owned link |
| PATCH | `/urls/:id` | yes | `originalUrl` and/or `expiresAt` (nullable) | 200, updated record |
| DELETE | `/urls/:id` | yes | UUID param | 204, soft delete |
| GET | `/health` | no | none | 200 `{ "status": "ok" }` |
| GET | `/metrics` | no | none | Prometheus text |
| GET | `/:shortCode` | no | none | 302 redirect; 404 if missing or inactive; 410 if expired |

Response envelope for JSON endpoints: `{ "status", "message", "data" }`. Validation failures are 400
with a joined message. Unique alias or code collisions return 409. Token failures return 401.

Access tokens last 15 minutes, refresh tokens 7 days. There is no refresh endpoint and no token
revocation; logout is client-side only.
