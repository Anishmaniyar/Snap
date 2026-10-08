import bcrypt from "bcryptjs";
import AppError from "../../errors/app-error.js";
import { signAccessToken, signRefreshToken } from "../../lib/jwt.js";
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

  return {
    user: toSafeUser(user),
    accessToken: signAccessToken(user.id),
    refreshToken: signRefreshToken(user.id),
  };
};

export const login = async (email: string, password: string) => {
  const user = await authRepository.findByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid email or password", 401);
  }

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
