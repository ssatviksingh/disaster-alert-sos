// backend/src/controllers/locationController.ts
import { Request, Response, NextFunction } from "express";
import { locationService } from "../services/LocationService";
import { ApiError } from "../utils/ApiError";

/**
 * POST /api/location/update
 * body: { latitude: number, longitude: number }
 * protected
 */
export const updateLocation = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const auth = (req as any).user as { id: string } | undefined;
        if (!auth || !auth.id) throw ApiError.unauthorized();

        const { latitude, longitude } = req.body as { latitude?: number; longitude?: number };
        if (typeof latitude !== "number" || typeof longitude !== "number") {
            throw ApiError.badRequest("latitude and longitude are required and must be numbers.");
        }

        const rec = await locationService.updateLocation(auth.id, latitude, longitude);
        return res.json({ ok: true, location: rec });
    } catch (err) {
        next(err);
    }
};

/**
 * GET /api/location/nearby?lat=...&lng=...&rKm=...
 * returns nearby users (mocked / minimal info)
 * public or protected — making it protected so we can show only to logged in users
 */
export const getNearby = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const qlat = Number(req.query.lat);
        const qlng = Number(req.query.lng);
        const rKm = Number(req.query.rKm) || 50;

        if (isNaN(qlat) || isNaN(qlng)) {
            throw ApiError.badRequest("lat and lng query parameters are required.");
        }

        const nearby = await locationService.getNearby(qlat, qlng, rKm);
        // send limited info to clients
        const sanitized = nearby.map((n) => ({
            userId: n.userId,
            latitude: n.latitude,
            longitude: n.longitude,
            distanceKm: Number(n.distanceKm.toFixed(3)),
            updatedAt: (n as any)?.updatedAt ?? null,
        }));
        return res.json({ ok: true, results: sanitized });
    } catch (err) {
        next(err);
    }
};
