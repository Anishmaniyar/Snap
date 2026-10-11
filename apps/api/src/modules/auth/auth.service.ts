import bcrypt from "bcryptjs";
import AppError from "../../errors/app-error.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
import logger from "../../lib/logger.js";
import * as authRepository from "./auth.repository.js";

const toSafeUser = (user: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const signup = async (name: string, email: string, password: string) => {
  const existing = await authRepository.findByEmail(email);
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await authRepository.createUser({ name, email, passwordHash });

  // Minimum identifiers only: userId, never email/password/tokens.
  logger.info({ userId: user.id }, "User registered successfully");

  return {
    user: toSafeUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};

export const login = async (email: string, password: string) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    // No email or userId here: avoids logging PII for unknown accounts
    // and avoids confirming account existence in logs.
    logger.warn({ reason: "unknown_account" }, "Login failed");
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    // Never log the submitted password or tokens.
    logger.warn(
      { userId: user.id, reason: "invalid_password" },
      "Login failed",
    );
    throw new AppError("Invalid email or password", 401);
  }

  logger.info({ userId: user.id }, "User logged in successfully");

  return {
    user: toSafeUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};

// Stateless JWT design: no server-side session/token store, so logout is
// a no-op here. The client discards the access/refresh tokens.
export const logout = async () => {
  return { message: "Logged out successfully" };
};
