// src/hooks/usePushRegister.ts
import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { pushApi } from "../api/push";
import { useNotificationStore } from "../store/notificationStore";
import { useAuthStore } from "../store/authStore";

export function usePushRegister() {
    const user = useAuthStore((s) => s.user);
    const token = useNotificationStore((s) => s.pushToken);
    const setAndSyncToken = useNotificationStore((s) => s.setAndSyncToken);

    useEffect(() => {
        if (!user || token) return;

        const register = async () => {
            // Emulator-safe check
            if (!Constants.isDevice) {
                console.log("[Push] Skipped (not a physical device)");
                return;
            }

            const { status } = await Notifications.getPermissionsAsync();
            let finalStatus = status;

            if (status !== "granted") {
                const req = await Notifications.requestPermissionsAsync();
                finalStatus = req.status;
            }

            if (finalStatus !== "granted") {
                console.log("[Push] Permission denied");
                return;
            }

            const expoToken = (
                await Notifications.getExpoPushTokenAsync({
                    projectId: Constants.expoConfig?.extra?.eas?.projectId,
                })
            ).data;

            console.log("[Push] Token:", expoToken);

            await pushApi.registerToken(expoToken);
            await setAndSyncToken(expoToken);
        };

        register().catch((e) => {
            console.log("[Push] register error", e);
        });
    }, [user, token, setAndSyncToken]);
}
