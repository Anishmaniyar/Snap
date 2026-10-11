import app from "./app.js";
import { config } from "./config/config.env.js";
import logger from "./lib/logger.js";
const PORT = config.server.port;
app.listen(PORT, () => {
    logger.info({ port: PORT }, "API server running");
});
//# sourceMappingURL=server.js.map