import { config } from "../../config/config.env.js";
import AppError from "../../errors/app-error.js";
import { generateShortCode } from "./url.code.js";
import * as urlRepository from "./url.repository.js";

const MAX_GENERATION_ATTEMPTS = 5;

// Prisma P2002 = unique constraint violation. Duck-typed (code check)
// so it works regardless of which @prisma/client copy threw the error.
const isUniqueViolation = (error: unknown): boolean => {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
};

const toCreateInput = (
  originalUrl: string,
  shortCode: string,
  userId: string,
  expiresAtDate?: Date,
) => ({
  originalUrl,
  shortCode,
  userId,
  ...(expiresAtDate ? { expiresAt: expiresAtDate } : {}),
});

const toResponse = (url: {
  id: string;
  originalUrl: string;
  shortCode: string;
  expiresAt: Date | null;
  isActive: boolean;
  userId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}) => ({
  ...url,
  shortUrl: `${config.app.baseUrl}/${url.shortCode}`,
});

const parseExpiresAt = (expiresAt?: string): Date | undefined => {
  if (!expiresAt) return undefined;

  const expiresAtDate = new Date(expiresAt);
  if (Number.isNaN(expiresAtDate.getTime())) {
    throw new AppError("Invalid expiresAt date", 400);
  }
  return expiresAtDate;
};

type UpdateUrlBody = {
  originalUrl?: string;
  expiresAt?: string | null;
};

export const createShortUrl = async (
  originalUrl: string,
  userId: string,
  shortCode?: string,
  expiresAt?: string,
) => {
  if (!originalUrl) {
    throw new AppError("Original URL is required", 400);
  }

  const expiresAtDate = parseExpiresAt(expiresAt);
  const alias = shortCode?.trim();

  // Custom alias flow: single INSERT attempt, no fallback to generated code.
  if (alias) {
    try {
      const url = await urlRepository.createUrl(
        toCreateInput(originalUrl, alias, userId, expiresAtDate),
      );
      return toResponse(url);
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new AppError("Short code already taken", 409);
      }
      throw error;
    }
  }

  // Generated-code flow: INSERT is the source of truth, retry on collision.
  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt++) {
    try {
      const url = await urlRepository.createUrl(
        toCreateInput(originalUrl, generateShortCode(), userId, expiresAtDate),
      );
      return toResponse(url);
    } catch (error) {
      if (!isUniqueViolation(error)) {
        throw error;
      }
    }
  }

  throw new AppError("Failed to generate unique short code, try again", 500);
};

export const getOriginalUrl = async (shortCode: string) => {
  const url = await urlRepository.findByShortCode(shortCode);

  if (!url) {
    throw new AppError("Short code not found", 404);
  }

  if (!url.isActive) {
    throw new AppError("Short code is inactive", 404);
  }

  if (url.expiresAt && url.expiresAt < new Date()) {
    throw new AppError("Short code has expired", 410);
  }

  return toResponse(url);
};

export const getUserUrls = async (userId: string) => {
  const urls = await urlRepository.findByUserId(userId);

  return urls.map((url) => ({
    ...url,
    shortUrl: `${config.app.baseUrl}/${url.shortCode}`,
  }));
};

export const getUrlById = async (id: string, userId: string) => {
  const url = await urlRepository.findSingleUrl(userId, id);

  if (!url) {
    throw new AppError("url is not valid", 404);
  }

  if (!url.isActive) {
    throw new AppError("url is not valid", 404);
  }

  // Expiration affects redirection only — the owner can still manage
  // (retrieve) an expired URL.
  const shortUrl = `${config.app.baseUrl}/${url.shortCode}`;

  return { ...url, shortUrl };
};

export const updateUrlById = async (
  body: UpdateUrlBody & Record<string, unknown>,
  userId: string,
  id: string,
) => {
  if (!body || Object.keys(body).length === 0) {
    throw new AppError("At least one field must be provided", 400);
  }

  // Whitelist supported fields. shortCode is immutable and customAlias
  // must never modify an existing short code — both are dropped here
  // (Zod also strips unknown keys before the controller runs).
  const data: { originalUrl?: string; expiresAt?: Date | null } = {};

  if (body.originalUrl !== undefined) {
    data.originalUrl = body.originalUrl as string;
  }

  if (body.expiresAt !== undefined) {
    const raw = body.expiresAt as string | null;
    if (raw === null) {
      data.expiresAt = null;
    } else {
      const parsed = parseExpiresAt(raw);
      if (parsed !== undefined) {
        data.expiresAt = parsed;
      }
    }
  }

  if (Object.keys(data).length === 0) {
    throw new AppError("At least one field must be provided", 400);
  }

  const update = await urlRepository.updateUrlData(data, userId, id);

  return toResponse(update);
};

export const deleteUrlById = async (id: string, userId: string) => {
  const url = await urlRepository.deleteUrl(id, userId);

  return url;
};
