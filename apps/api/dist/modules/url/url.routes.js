import { Router } from "express";
export const urlRouter = Router();
// TODO (all protected — requireAuth + validate + ownership check):
//   POST   /    -> create (body: originalUrl, customAlias?, expiresAt?)
//   GET    /    -> list own URLs (query: pagination)
//   GET    /:id -> get one by id
//   PATCH  /:id -> update (originalUrl / expiresAt / isActive)
//   DELETE /:id -> delete/deactivate
//
// NOTE: public GET /:shortCode redirect is mounted at the app root (see app.ts),
// NOT under /api/v1/urls, and must stay public (no requireAuth).
//# sourceMappingURL=url.routes.js.map