import express from "express";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { errorHandler } from "./middleware/error.middleware.js";
// TODO: import routers once implemented:
// import { authRouter } from "./modules/auth/auth.routes.js";
// import { userRouter } from "./modules/user/user.routes.js";
// import { urlRouter } from "./modules/url/url.routes.js";
const app = express();
// TODO: helmet — `pnpm add helmet` (common HTTP security headers).
// TODO: cors — `pnpm add cors`, allow only configured FRONTEND_ORIGIN (never "*" in prod).
// NOTE: CORS is not authentication; Helmet is not complete security.
app.use(express.json());
app.use(requestLogger);
app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
});
// TODO: app.use("/api/v1/auth", authRouter);
// TODO: app.use("/api/v1/urls", urlRouter);
// TODO: public redirect — GET "/:shortCode" (no requireAuth; 404 inactive/missing, 410 expired, else 302).
app.use(notFound);
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map