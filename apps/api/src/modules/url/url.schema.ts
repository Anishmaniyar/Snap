import { z } from "zod";

export const createUrlSchema = z.object({
  body: z.object({
    originalUrl: z.url("Invalid URL format"),

    customAlias: z
      .string()
      .trim()
      .min(3, "Custom alias must be at least 3 characters long")
      .max(10, "Custom alias must be at most 10 characters long")
      .regex(
        /^[A-Za-z0-9_-]+$/,
        "Custom alias may contain only letters, numbers, hyphen and underscore",
      )
      .optional(),

    expiresAt: z.iso.datetime("Invalid expiresAt datetime").optional(),
  }),
});

export const getUrlByIdSchema = z.object({
  params: z.object({
    id: z.uuid("Requires a valid id format"),
  }),
});

export const updateUrlById = z.object({
  body: z.object({
    originalUrl: z.url("Invalid URL format").optional(),

    expiresAt: z.iso.datetime("Invalid expiresAt datetime").optional(),
  }),

  params: z.object({
    id: z.uuid("Requires a valid id format"),
  }),
});

export const deleteUrlById = z.object({
  params: z.object({
    id: z.uuid("Requires a valid id format"),
  }),
});
