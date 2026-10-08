import { db } from "@snap/database";
import AppError from "../../errors/app-error.js";
export const findByShortCode = async (shortCode) => {
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
export const createUrl = async (input) => {
    return await db.url.create({
        data: input,
    });
};
export const findByUserId = async (userId) => {
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
export const findSingleUrl = async (userId, id) => {
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
export const updateUrlData = async (data, userId, id) => {
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
export const deleteUrl = async (id, userId) => {
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
//# sourceMappingURL=url.repository.js.map