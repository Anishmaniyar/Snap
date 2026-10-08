import app from "./app.js";
import { config } from "./config/config.env.js";
import logger from "./lib/logger.js";
const PORT = config.server.port;
app.listen(PORT, () => {
    logger.info(`API server running on port ${PORT}`);
});
//# sourceMappingURL=server.js.map