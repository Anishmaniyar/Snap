import app from "./app.js";
import { config } from "./config/config.env.js";
import logger from "./lib/logger.js";

const PORT = config.server.port;

const server = app.listen(PORT, () => {
  // console.log fallback: pino-pretty runs in a worker thread and its
  // output can be lost if the transport fails, so always print startup
  // synchronously too. If you see neither line, this file never ran.
  console.log(`API server running on port ${PORT}`);
  logger.info({ port: PORT }, "API server running");
});

server.on("error", (err: NodeJS.ErrnoException) => {
  console.error("Failed to start API server:", err);
  logger.error({ err }, "Failed to start API server");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  logger.error({ reason }, "Unhandled rejection");
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception:", err);
  logger.error({ err }, "Uncaught exception");
  process.exit(1);
});
