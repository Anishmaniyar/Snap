import type { RequestHandler } from "express";
import {
  collectDefaultMetrics,
  Counter,
  Histogram,
  Registry,
} from "prom-client";

export const metricsRegistry = new Registry();

collectDefaultMetrics({
  register: metricsRegistry,
});

const httpRequestsTotal = new Counter({
  name: "http_requests_total",
  help: "Total number of completed HTTP requests",
  labelNames: ["method", "route", "status_code"] as const,
  registers: [metricsRegistry],
});

const httpRequestsDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP requests duration in seconds",
  labelNames: ["method", "route", "status_code"] as const,
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [metricsRegistry],
});

export const metricsMiddleware: RequestHandler = (req, res, next) => {
  if (req.path === "/metrics") {
    next();
    return;
  }

  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const routePath = req.route?.path;
    const route =
      typeof routePath === "string"
        ? `${req.baseUrl}${routePath}`
        : "unmatched";

    const labels = {
      method: req.method,
      route,
      status_code: String(res.statusCode),
    };

    const durationSeconds =
      Number(process.hrtime.bigint() - start) / 1_000_000_000;

    httpRequestsTotal.inc(labels);
    httpRequestsDuration.observe(labels, durationSeconds);
  });

  next();
};

export const metricsHandler: RequestHandler = async (_req, res, next) => {
  try {
    res.setHeader("Content-Type", metricsRegistry.contentType);
    res.end(await metricsRegistry.metrics());
  } catch (error) {
    next(error);
  }
};
