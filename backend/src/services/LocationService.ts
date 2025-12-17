// backend/src/services/locationService.ts
import { UserLocation } from "../models/Location";

const toRadians = (deg: number) => (deg * Math.PI) / 180;

// Haversine distance in kilometers
const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

export const locationService = {
    async updateLocation(userId: string, lat: number, lon: number) {
        const record = await UserLocation.findOneAndUpdate(
            { userId },
            { latitude: lat, longitude: lon },
            { upsert: true, new: true }
        ).lean();
        return record;
    },

    async getNearby(lat: number, lon: number, radiusKm = 50, limit = 50) {
        // simple approach: fetch all and compute distances (acceptable for small dev DB)
        const all = await UserLocation.find().lean();
        const nearby = all
            .map((r) => {
                const dist = haversineKm(lat, lon, r.latitude, r.longitude);
                return { ...r, distanceKm: dist };
            })
            .filter((r) => r.distanceKm <= radiusKm)
            .sort((a, b) => a.distanceKm - b.distanceKm)
            .slice(0, limit);
        return nearby;
    },
};
