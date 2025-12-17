// backend/src/controllers/pushController.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../models/User";
import { ApiError } from "../utils/ApiError";
import { sendExpoPush } from "../services/pushService";

export const registerPushToken = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id;
        const { token } = req.body as { token?: string };

        if (!userId) {
            throw new ApiError(401, "Unauthorized");
        }

        if (!token) {
            throw new ApiError(400, "Missing token");
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { expoPushToken: token },
            { new: true }
        );
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};

// simple debug endpoint to send yourself a test notification
export const sendTestNotification = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            throw new ApiError(401, "Unauthorized");
        }

        const user = await User.findById(userId);
        if (!user || !user.expoPushToken) {
            throw new ApiError(400, "No Expo push token registered for this user");
        }
        if (!user.expoPushToken.startsWith("ExponentPushToken")) {
            throw new ApiError(400, "Invalid Expo push token");
        }
        await sendExpoPush(
            user.expoPushToken,
            "Test notification",
            "This is a test disaster alert from your backend.",
            { test: true }
        );

        return res.json({ ok: true });
    } catch (err) {
        next(err);
    }
};
