// TODO: validate req[source] against schema; on success replace req[source] with parsed
// data; on failure forward a 400 validation error to the error middleware.
export function validate(_schema, _source = "body") {
    return (_req, _res, _next) => {
        throw new Error("TODO: implement validate");
    };
}
//# sourceMappingURL=validation.middleware.js.map