import jwt from "jsonwebtoken";
import { config } from "../config/config.env.js";
import AppError from "../errors/app-error.js";

export interface AccessTokenPayload {
  id: string;
}

// JWT configuration + helpers only. Actual tokens are returned to the
// client by the auth service — nothing is stored here.
export const signAccessToken = (userId: string): string => {
  return jwt.sign({ id: userId } satisfies AccessTokenPayload, config.auth.accessSecret, {
    expiresIn: "15m",
  });
};

export const signRefreshToken = (userId: string): string => {
  return jwt.sign({ id: userId } satisfies AccessTokenPayload, config.auth.refreshSecret, {
    expiresIn: "7d",
  });
};

const verifyToken = (token: string, secret: string): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, secret);
    if (typeof decoded !== "object" || decoded === null || typeof decoded.id !== "string") {
      throw new AppError("Invalid token payload", 401);
    }
    return { id: decoded.id };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Invalid or expired token", 401);
  }
};

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  return verifyToken(token, config.auth.accessSecret);
};

export const verifyRefreshToken = (token: string): AccessTokenPayload => {
  return verifyToken(token, config.auth.refreshSecret);
};
