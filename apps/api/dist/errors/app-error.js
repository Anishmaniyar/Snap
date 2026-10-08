export default class AppError extends Error {
    statusCode;
    status;
    isOperational;
    // Creates an operational error with an HTTP status code and fail/error status.
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
//# sourceMappingURL=app-error.js.map