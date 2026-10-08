import logger from "../lib/logger.js";
export function requestLogger(req, res, next) {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        logger.info({
            method: req.method,
            path: req.originalUrl,
            statusCode: res.statusCode,
            duration,
        }, "HTTP request");
    });
    next();
}
//# sourceMappingURL=request-logger.middleware.js.map