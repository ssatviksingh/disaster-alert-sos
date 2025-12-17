// src/hooks/useLocation.ts
import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { locationApi } from "../api/location";
import { useLocationStore } from "../store/locationStore";
import { useAuthStore } from "../store/authStore";

export function useLocation() {
    const user = useAuthStore((s) => s.user);
    const setLocation = useLocationStore((s) => s.setLocation);
    const watcherRef = useRef<Location.LocationSubscription | null>(null);

    useEffect(() => {
        if (!user) return;

        const start = async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") {
                console.log("[Location] permission denied");
                return;
            }

            watcherRef.current = await Location.watchPositionAsync(
                {
                    accuracy: Location.Accuracy.Balanced,
                    distanceInterval: 50, // meters
                    timeInterval: 15000, // 15 sec
                },
                async (pos) => {
                    const { latitude, longitude } = pos.coords;

                    setLocation(latitude, longitude);

                    try {
                        await locationApi.updateLocation({ latitude, longitude });
                    } catch (e) {
                        console.log("[Location] backend sync failed");
                    }
                }
            );
        };

        start();

        return () => {
            watcherRef.current?.remove();
            watcherRef.current = null;
        };
    }, [user, setLocation]);
}
