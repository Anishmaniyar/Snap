import { db } from "@snap/database";
import AppError from "../../errors/app-error.js";

export const findByShortCode = async (shortCode: string) => {
  return await db.url.findUnique({
    where: {
      shortCode,
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      expiresAt: true,
      isActive: true,
    },
  });
};

export const createUrl = async (input: {
  originalUrl: string;
  shortCode: string;
  userId: string;
  expiresAt?: Date;
}) => {
  return await db.url.create({
    data: input,
  });
};

export const findByUserId = async (userId: string) => {
  return await db.url.findMany({
    where: {
      userId,
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      expiresAt: true,
      isActive: true,
      createdAt: true,
    },
  });
};

export const findSingleUrl = async (userId: string, id: string) => {
  const url = await db.url.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!url) {
    throw new AppError("URL not found", 404);
  }

  return await db.url.findFirst({
    where: {
      id: url.id,
    },
    select: {
      id: true,
      originalUrl: true,
      shortCode: true,
      expiresAt: true,
      isActive: true,
    },
  });
};

export const updateUrlData = async (
  data: object,
  userId: string,
  id: string,
) => {
  const url = await db.url.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!url) {
    throw new AppError("URL not found", 404);
  }

  return await db.url.update({
    where: {
      id: url.id,
    },
    data,
  });
};

export const deleteUrl = async (id: string, userId: string) => {
  const url = await db.url.findFirst({
    where: {
      id,
      userId,
    },
  });

  if (!url) {
    throw new AppError("URL not found", 404);
  }

  return await db.url.update({
    where: {
      id: url.id,
    },
    data: {
      isActive: false,
    },
  });
};
