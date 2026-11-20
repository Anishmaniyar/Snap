import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 5173);
const apiTarget = process.env.API_TARGET || "http://localhost:8000";

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

const isApiRequest = (pathname) =>
  pathname.startsWith("/api/") ||
  pathname === "/health" ||
  pathname === "/metrics";

const proxy = async (req, res) => {
  const url = `${apiTarget}${req.url}`;
  const init = { method: req.method, headers: {} };

  for (const [key, value] of Object.entries(req.headers)) {
    if (["host", "connection", "content-length", "accept-encoding"].includes(key)) continue;
    init.headers[key] = value;
  }

  if (!["GET", "HEAD"].includes(req.method)) {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    init.body = Buffer.concat(chunks);
  }

  try {
    const upstream = await fetch(url, init);
    res.writeHead(upstream.status, {
      "content-type": upstream.headers.get("content-type") || "application/json",
      "cache-control": "no-store",
    });
    res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch {
    res.writeHead(502, { "content-type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        status: "error",
        message: `API is not reachable at ${apiTarget}. Start it with pnpm dev.`,
      }),
    );
  }
};

const serve = async (pathname, res) => {
  const requested = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(join(root, normalize(decodeURIComponent(requested)).replace(/^([/\\])+/, "")));

  if (filePath !== root && !filePath.startsWith(root + sep)) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const body = await readFile(filePath);
    res.writeHead(200, {
      "content-type": types[extname(filePath)] || "application/octet-stream",
      "cache-control": "no-store",
    });
    res.end(body);
  } catch {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
};

createServer(async (req, res) => {
  const pathname = new URL(req.url, "http://localhost").pathname;
  if (isApiRequest(pathname)) {
    await proxy(req, res);
    return;
  }
  await serve(pathname, res);
}).listen(port, () => {
  console.log(`Snap UI: http://localhost:${port}`);
  console.log(`Proxying /api, /health and /metrics to ${apiTarget}`);
});
