// backend/src/controllers/sosController.ts
import { RequestHandler } from "express";
import { SosRequest } from "../models/SosRequest";
import { ApiError } from "../utils/ApiError";

// POST /api/sos
export const createSos: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { message, latitude, longitude, status } = req.body as {
            message?: string;
            latitude?: number;
            longitude?: number;
            status?: string;
        };

        const sos = await SosRequest.create({
            user: authUser.id,
            message,
            latitude,
            longitude,
            status: (status as any) ?? "pending_send",
            attachments: [],
        });

        res.status(201).json(sos);
    } catch (err) {
        next(err);
    }
};

// GET /api/sos/mine
export const listMySos: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const sosList = await SosRequest.find({ user: authUser.id })
            .sort({ createdAt: -1 })
            .limit(100);

        res.json(sosList);
    } catch (err) {
        next(err);
    }
};
