// TODO: map AppError -> statusCode + stable JSON body; log unexpected errors;
// never expose stack traces or internals in production responses.
export const errorHandler = (_err, _req, res, _next) => {
    // TODO: replace with AppError-aware implementation.
    res.status(500).json({ error: "Internal Server Error" });
};
//# sourceMappingURL=error.middleware.js.map