import express from "express";
import { requestLogger } from "./middleware/request-logger.middleware.js";
import { notFound } from "./middleware/not-found.middleware.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
import RootRouter from "./routes/index.js";
import { redirectToOriginalUrl } from "./modules/url/url.controller.js";

const app = express();

// TODO: helmet — `pnpm add helmet` (common HTTP security headers).
// TODO: cors — `pnpm add cors`, allow only configured FRONTEND_ORIGIN (never "*" in prod).
// NOTE: CORS is not authentication; Helmet is not complete security.

app.use(express.json());
app.use(requestLogger);
app.use("/api/v1", RootRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get("/:shortCode", redirectToOriginalUrl);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
