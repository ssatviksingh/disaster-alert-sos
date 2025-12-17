// frontend/src/store/locationStore.ts
import { create } from "zustand";
import NetInfo from "@react-native-community/netinfo";
import { locationApi } from "../api/location";

export type RiskZone = {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    severity: "critical" | "high" | "medium" | "low";
    type: string;
};

type LocationState = {
    isSharing: boolean;
    latitude: number | null;
    longitude: number | null;
    startedAt: string | null;
    watchId: any | null;
    riskZones: RiskZone[];
    nearbyRisks: RiskZone[] | { userId: string; latitude: number; longitude: number; distanceKm: number }[];

    startSharing: () => Promise<void>;
    stopSharing: () => void;
    updateLocation: (lat: number, lng: number) => Promise<void>;
    checkRiskZones: (lat: number, lng: number) => RiskZone[] | null;
    addRiskZone: (zone: RiskZone) => void;
    removeRiskZone: (id: string) => void;
};

export const useLocationStore = create<LocationState>((set, get) => ({
    isSharing: false,
    latitude: null,
    longitude: null,
    startedAt: null,
    watchId: null,
    riskZones: [],
    nearbyRisks: [],

    startSharing: async () => {
        try {
            // Try to get permissions + current position using expo-location if available
            let currentLat = 28.6139;
            let currentLng = 77.209;

            try {
                // dynamic import to avoid RN web issues
                // eslint-disable-next-line @typescript-eslint/no-var-requires
                const Location = require("expo-location");
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status === "granted") {
                    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
                    currentLat = pos.coords.latitude;
                    currentLng = pos.coords.longitude;

                    // watch updates
                    const sub = await Location.watchPositionAsync(
                        {
                            accuracy: Location.Accuracy.High,
                            timeInterval: 5000,
                            distanceInterval: 10,
                        },
                        async (loc: any) => {
                            const lat = loc.coords.latitude;
                            const lng = loc.coords.longitude;
                            await get().updateLocation(lat, lng);
                        }
                    );
                    set({ watchId: sub });
                }
            } catch (e) {
                // expo-location not available; use mocked coords
                console.log("[Location] expo-location not available, using mock coords", e);
            }

            set({
                isSharing: true,
                latitude: currentLat,
                longitude: currentLng,
                startedAt: new Date().toISOString(),
            });

            // notify backend if online
            const net = await NetInfo.fetch();
            if (net.isConnected && get().latitude != null && get().longitude != null) {
                try {
                    await locationApi.updateLocation({ latitude: currentLat, longitude: currentLng });
                } catch (e) {
                    console.log("[Location] updateLocation backend failed", e);
                }
            }

            // fetch nearby users
            if (net.isConnected) {
                try {
                    const res = await locationApi.getNearby(currentLat, currentLng);
                    set({ nearbyRisks: res.results ?? [] });
                } catch (e) {
                    console.log("[Location] getNearby failed", e);
                }
            }
        } catch (e) {
            console.error("[Location] startSharing error", e);
            set({
                isSharing: true,
                latitude: 28.6139,
                longitude: 77.209,
                startedAt: new Date().toISOString(),
            });
        }
    },

    stopSharing: () => {
        const { watchId } = get();
        try {
            if (watchId && typeof watchId.remove === "function") {
                watchId.remove();
            } else if (watchId && typeof watchId.unsubscribe === "function") {
                watchId.unsubscribe();
            }
        } catch (e) {
            console.warn("[Location] stopSharing cleanup failed", e);
        }
        set({
            isSharing: false,
            startedAt: null,
            latitude: null,
            longitude: null,
            watchId: null,
            nearbyRisks: [],
        });
    },

    updateLocation: async (lat: number, lng: number) => {
        set({ latitude: lat, longitude: lng });
        try {
            const net = await NetInfo.fetch();
            if (net.isConnected) {
                // send to backend but don't block UI
                locationApi.updateLocation({ latitude: lat, longitude: lng }).catch((e) => {
                    console.log("[Location] updateLocation POST failed", e);
                });

                // refresh nearby
                const res = await locationApi.getNearby(lat, lng);
                set({ nearbyRisks: res.results ?? [] });
            }
        } catch (e) {
            console.log("[Location] updateLocation error", e);
        }
        get().checkRiskZones(lat, lng);
    },

    checkRiskZones: (lat: number, lng: number) => {
        const { riskZones } = get();
        const nearby = riskZones.filter((zone) => {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const R = 6371000;
            const dLat = toRad(zone.latitude - lat);
            const dLon = toRad(zone.longitude - lng);
            const a =
                Math.sin(dLat / 2) ** 2 +
                Math.cos(toRad(lat)) * Math.cos(toRad(zone.latitude)) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            const distance = R * c;
            return distance <= zone.radius;
        });
        set({ nearbyRisks: nearby });
        return nearby;
    },

    addRiskZone: (zone: RiskZone) => {
        const existing = get().riskZones;
        set({ riskZones: [zone, ...existing] });
        const { latitude, longitude } = get();
        if (latitude != null && longitude != null) get().checkRiskZones(latitude, longitude);
    },

    removeRiskZone: (id: string) => {
        const updated = get().riskZones.filter((z) => z.id !== id);
        set({ riskZones: updated });
        const { latitude, longitude } = get();
        if (latitude != null && longitude != null) get().checkRiskZones(latitude, longitude);
    },
}));
