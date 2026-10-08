// TODO: return a consistent 404 JSON body for unmatched routes.
export function notFound(_req, res) {
    res.status(404).json({ error: "Not Found" });
}
//# sourceMappingURL=not-found.middleware.js.map