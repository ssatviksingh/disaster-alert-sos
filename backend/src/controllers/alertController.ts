// backend/src/controllers/alertController.ts
import { RequestHandler } from "express";
import { Alert } from "../models/Alert";
import { ApiError } from "../utils/ApiError";

// POST /api/alerts
export const createAlert: RequestHandler = async (req, res, next) => {
    try {
        const {
            type,
            title,
            description,
            location,
            latitude,
            longitude,
            severity,
            source,
        } = req.body;

        if (
            !type ||
            !title ||
            !description ||
            !location ||
            typeof latitude !== "number" ||
            typeof longitude !== "number" ||
            !severity
        ) {
            throw ApiError.badRequest(
                "type, title, description, location, latitude, longitude and severity are required"
            );
        }

        const alert = await Alert.create({
            type,
            title,
            description,
            location,
            latitude,
            longitude,
            severity,
            source: source ?? "manual",
        });

        res.status(201).json(alert);
    } catch (err) {
        next(err);
    }
};

// GET /api/alerts
export const listAlerts: RequestHandler = async (_req, res, next) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 }).limit(100);
        res.json(alerts);
    } catch (err) {
        next(err);
    }
};

// GET /api/alerts/:id
export const getAlertById: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const alert = await Alert.findById(id);

        if (!alert) {
            throw new ApiError(404, "Alert not found");
        }

        res.json(alert);
    } catch (err) {
        next(err);
    }
};
