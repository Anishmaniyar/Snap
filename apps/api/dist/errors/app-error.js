// Simple application error abstraction. error.middleware.ts maps this to HTTP responses.
// TODO: extend with error codes as needed:
// validation | authentication | authorization | notFound | conflict | expired | internal.
export class AppError extends Error {
    statusCode;
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
    }
}
//# sourceMappingURL=app-error.js.map