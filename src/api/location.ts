// frontend/src/api/location.ts
import { api } from "./client";

export const locationApi = {
    updateLocation: async (body: { latitude: number; longitude: number }) => {
        const res = await api.post("/api/location/update", body);
        return res.data;
    },

    getNearby: async (lat: number, lng: number, rKm = 50) => {
        const res = await api.get("/api/location/nearby", {
            params: { lat, lng, rKm },
        });
        return res.data;
    },
};
