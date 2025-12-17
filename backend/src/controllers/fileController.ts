// backend/src/controllers/fileController.ts
import { RequestHandler } from "express";
import { FileAsset } from "../models/FileAsset";
import { ApiError } from "../utils/ApiError";
import mongoose from "mongoose";

// Helper to compute size label
function formatSize(sizeBytes: number): string {
    if (sizeBytes < 1024) return `${sizeBytes} B`;
    const kb = sizeBytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
}

// POST /api/files
export const createFile: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { name, type, sizeBytes, tags, url } = req.body as {
            name?: string;
            type?: string;
            sizeBytes?: number;
            tags?: string[];
            url?: string;
        };

        if (!name || !url || typeof sizeBytes !== "number") {
            throw new ApiError(
                400,
                "name, url, and numeric sizeBytes are required."
            );
        }

        const file = await FileAsset.create({
            user: authUser.id,
            name,
            type: (type as any) ?? "document",
            sizeBytes,
            sizeLabel: formatSize(sizeBytes),
            tags: tags ?? [],
            url,
        });

        res.status(201).json(file);
    } catch (err) {
        next(err);
    }
};

// GET /api/files/mine
export const listMyFiles: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const files = await FileAsset.find({ user: authUser.id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(files);
    } catch (err) {
        next(err);
    }
};

// GET /api/files/mine/:id
export const getMyFileById: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid file id");
        }

        const file = await FileAsset.findOne({ _id: id, user: authUser.id });
        if (!file) {
            throw new ApiError(404, "File not found");
        }

        res.json(file);
    } catch (err) {
        next(err);
    }
};

// DELETE /api/files/mine/:id
export const deleteMyFileById: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new ApiError(400, "Invalid file id");
        }

        const result = await FileAsset.deleteOne({ _id: id, user: authUser.id });
        if (result.deletedCount === 0) {
            throw new ApiError(404, "File not found or not yours.");
        }

        res.json({ deleted: true });
    } catch (err) {
        next(err);
    }
};
