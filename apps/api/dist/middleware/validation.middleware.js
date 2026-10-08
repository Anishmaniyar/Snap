import { ZodError } from "zod";
import AppError from "../errors/app-error.js";
// Validates body, query, and params against a Zod schema before the controller runs.
export const validateRequest = (schema) => {
    // Parses the incoming request and replaces it with the validated body, query, and params.
    return async (req, res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            if (parsed && typeof parsed === "object") {
                const castedParsed = parsed;
                if (castedParsed.body)
                    req.body = castedParsed.body;
                if (castedParsed.params)
                    req.params = castedParsed.params;
                if (castedParsed.query) {
                    for (const key in req.query) {
                        delete req.query[key];
                    }
                    Object.assign(req.query, castedParsed.query);
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof ZodError) {
                const errorMessage = error.issues
                    .map((issue) => issue.message)
                    .join(", ");
                const failedFields = error.issues
                    .map((issue) => issue.path.join("."))
                    .join(", ");
                console.warn(`[validate] 400 ${req.method} ${req.originalUrl} - invalid field(s): ${failedFields} (${errorMessage})`);
                return next(new AppError(errorMessage, 400));
            }
            return next(error);
        }
    };
};
//# sourceMappingURL=validation.middleware.js.map