# Snap — project state

Snapshot of what is built today (backend plus the new console).

## Stage

Backend MVP with authentication and URL shortening, wrapped in a monorepo with Docker and CI.
A browser console now exists for seeing the data and the request flow. There are no automated
unit/integration tests in the repo, and no frontend framework: the console is plain HTML, CSS and
ES modules.

## What it has

| Area | Present |
| --- | --- |
| Runtime | TypeScript, Express 5, Node, pnpm workspace (`apps/api`, `packages/database`, `apps/web`) |
| Data | PostgreSQL 17, Prisma 7, `User` and `Url` models, one applied migration |
| Auth | bcrypt signup/login, access JWT (15m) + refresh JWT (7d), Bearer middleware |
| Links | Create with random 6-char Base62 code or custom alias, list, get by id, patch, soft delete |
| Redirect | Public `GET /:shortCode`, 302 to destination, 404 missing/inactive, 410 expired |
| Validation | Zod schemas for bodies, params and query; field paths logged without values |
| Observability | Pino logs with redaction and request IDs, prom-client counters and latency histogram |
| Infra | Docker Compose (API, Postgres, Prometheus, Grafana, Loki, Alloy), GitHub Actions CI, k6 load scripts |
| Frontend | Dark console with Overview, Links, Detail, Flow, Health and Sign in views |

## Current flows

### Create a link

`POST /api/v1/urls` → `express.json` → `requestLogger` → `metricsMiddleware` → `authenticate`
(Bearer JWT, user lookup) → Zod validation → controller → `createShortUrl` → Prisma → Postgres.
A generated code retries up to five times on a unique-constraint collision; a custom alias gets one
insert and returns 409 if taken. Response: 201 with the record and `shortUrl`.

### Follow a link

`GET /:shortCode` → `redirectToOriginalUrl` → `getOriginalUrl` → `findByShortCode` → checks for
inactive (404) and expired (410) → 302 with `Location: originalUrl`.

### Authenticate

`POST /api/v1/auth/signup` or `/login` → Zod → bcrypt → tokens. Access token is checked on every
`/urls` request. Logout is a no-op; the client discards tokens.

## What is missing or worth looking into

These are areas to investigate, not fixes:

- No unit or integration tests. Vitest and Supertest are configured and CI runs `pnpm test`, but
  there are no `*.test.ts` files and no `tests/setup.ts`; `.env.test` is also absent.
- No README in the repo before `docs/` was added.
- `ioredis` and `REDIS_URL` are configured but no Redis client exists, so redirects are one DB read
  each and there is no cache.
- No CORS or Helmet. `FRONTEND_ORIGIN` is set but unused; security headers are a TODO in `app.ts`.
- No refresh-token endpoint; logout does not revoke anything.
- The `user` module is empty stubs and is not mounted in the router.
- No click analytics. The console shows a dash for redirects because the API does not record them.
- No rate limiting on create or redirect.
- Soft-deleted rows keep their unique short code, so codes are never reclaimed.
- No URL safety checks beyond Zod's URL parse, no idempotency on create, and no cleanup job for
  expired rows.
- Config inconsistencies: JWT secrets are placeholders in `.env`, `APP_BASE_URL` is `http://snap.in`,
  Docker `EXPOSE` says 3000 while Compose maps 8000, and `dist/` contains stale build output.

## Where things live

- `apps/api/src/app.ts` — middleware order and route mounting
- `apps/api/src/routes/index.ts` — `/api/v1` subrouters
- `apps/api/src/modules/*` — auth, url and the empty user stubs
- `apps/api/src/lib` — JWT, logger, metrics, async handler
- `apps/api/src/middleware` — auth, validation, errors, 404, request logging
- `packages/database/prisma/schema.prisma` — data model
- `apps/web` — browser console
