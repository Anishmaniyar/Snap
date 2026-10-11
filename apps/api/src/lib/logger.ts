import pino from "pino";
import { config } from "../config/config.env.js";

// Exported so redaction coverage can be verified behaviorally in tests
// without changing the singleton's runtime behaviour.
export const redactOptions = {
  paths: [
    "password",
    "*.password",
    "passwordHash",
    "*.passwordHash",
    "accessToken",
    "*.accessToken",
    "refreshToken",
    "*.refreshToken",
    "token",
    "*.token",
    "secret",
    "*.secret",
    "otp",
    "*.otp",
    "authorization",
    "*.authorization",
    "cookie",
    "*.cookie",
    "req.headers.authorization",
    "req.headers.cookie",
  ],
  censor: "[REDACTED]",
} as const;

const logger = pino({
  level: config.logging.level,

  redact: {
    paths: [...redactOptions.paths],
    censor: redactOptions.censor,
  },

  ...(config.env === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        },
      }
    : {}),
});

export default logger;
