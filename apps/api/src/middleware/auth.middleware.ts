import { db } from "@snap/database";
import AppError from "../errors/app-error.js";
import asyncHandler from "../lib/asyncHandler.js";
import { verifyAccessToken } from "../lib/jwt.js";

export const authenticate = asyncHandler(async (req, _res, next) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized, login session token is missing", 401);
  }

  // Throws 401 on expired/invalid token. No fallback secrets.
  const decoded = verifyAccessToken(token);

  const currentUser = await db.user.findUnique({
    where: { id: decoded.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!currentUser) {
    throw new AppError(
      "The user belonging to this token no longer exists",
      401,
    );
  }

  req.user = {
    id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    createdAt: currentUser.createdAt,
  };
  next();
});
