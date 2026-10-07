// Simple application error abstraction. error.middleware.ts maps this to HTTP responses.
// TODO: extend with error codes as needed:
// validation | authentication | authorization | notFound | conflict | expired | internal.
export class AppError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}
