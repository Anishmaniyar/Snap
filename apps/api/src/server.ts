import app from "./app.js";
import logger from "./lib/logger.js";

// TODO: use typed config from ./config/env.js instead of process.env directly.
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API server running on port ${PORT}`);
});
