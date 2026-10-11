import logger from "../lib/logger.js";
import { randomUUID } from "crypto";
export function requestLogger(req, res, next) {
    const start = Date.now();
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            requestId,
            method: req.method,
            path: req.path,
            statusCode: res.statusCode,
            durationMs: duration,
        }, "HTTP request");
    });
    res.setHeader("X-Request-ID", requestId);
    next();
}
//# sourceMappingURL=request-logger.middleware.js.map