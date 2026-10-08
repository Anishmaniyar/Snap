import asyncHandler from "../../lib/asyncHandler.js";
import AppError from "../../errors/app-error.js";
import * as urlService from "./url.service.js";

export const shortUrl = asyncHandler(async (req, res) => {
  const { originalUrl, customAlias, expiresAt } = req.body;

  const userId = req.user.id;
  if (!userId) {
    throw new AppError("Not authorized, login required", 401);
  }

  const result = await urlService.createShortUrl(
    originalUrl,
    userId,
    customAlias,
    expiresAt,
  );

  res.status(201).json({
    status: "success",
    message: "Short URL created successfully",
    data: result,
  });
});

export const redirectToOriginalUrl = asyncHandler(async (req, res) => {
  const shortCode = req.params.shortCode;

  if (typeof shortCode !== "string" || !shortCode) {
    throw new AppError("Short code not found", 404);
  }

  const result = await urlService.getOriginalUrl(shortCode);

  return res.status(302).redirect(result.originalUrl);
});

export const getUserUrls = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    throw new AppError("Not authorized, login required", 401);
  }

  const result = await urlService.getUserUrls(userId);

  res.status(200).json({
    status: "success",
    message: "User URLs retrieved successfully",
    data: result,
  });
});

export const getUrlById = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.id;

  const result = await urlService.getUrlById(id, userId);

  return res.status(200).json({
    status: "success",
    message: "Url fetched successfully by id",
    data: result,
  });
});

export const updateUrlById = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const id = req.params.id as string;

  const result = await urlService.updateUrlById(req.body, userId, id);

  return res.status(200).json({
    status: "success",
    message: "Url data updated successfullly",
    data: result,
  });
});

export const deleteUrlById = asyncHandler(async (req, res) => {
  const id = req.params.id as string;
  const userId = req.user.id;

  const result = await urlService.deleteUrlById(id, userId);

  return res.status(204).json({
    status: "success",
    message: "Url deleted successfully by id",
  });
});
