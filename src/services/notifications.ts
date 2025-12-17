// FRONTEND: src/services/notifications.ts
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync(): Promise<string | null> {
    try {
        // 🔹 Skip remote push registration when running inside Expo Go
        const isExpoGo =
            Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

        if (isExpoGo) {
            console.log(
                "[Notifications] Running inside Expo Go – skipping remote push registration. " +
                "Remote push will only work in a dev/production build."
            );
            return null;
        }

        if (!Device.isDevice) {
            console.log(
                "[Notifications] Must use a physical device for push notifications"
            );
            return null;
        }

        // Ask for permission
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== "granted") {
            console.log("[Notifications] Permission not granted");
            return null;
        }

        // Get Expo push token
        const projectId =
            Constants.expoConfig?.extra?.eas?.projectId ??
            Constants.easConfig?.projectId ??
            Constants.expoConfig?.slug; // fallback – mainly for dev

        if (!projectId) {
            console.log(
                "[Notifications] Missing projectId for push token, returning null"
            );
            return null;
        }

        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId,
        });

        console.log("[Notifications] Expo push token:", tokenData.data);

        // Android channel
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#FF231F7C",
            });
        }

        return tokenData.data;
    } catch (e) {
        console.log("[Notifications] Error getting push token", e);
        return null;
    }
}

// Updated to satisfy NotificationBehavior type
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});
