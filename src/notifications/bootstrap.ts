import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// 🔔 Universal notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        // These two are needed in newer expo-notifications types
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function bootstrap() {
    console.log("[Notifications] bootstrap called (Expo Go: remote push limited)");

    // Android channel setup
    if (Platform.OS === "android") {
        try {
            await Notifications.setNotificationChannelAsync("default", {
                name: "default",
                importance: Notifications.AndroidImportance.DEFAULT,
            });
        } catch (e) {
            console.log("[Notifications] Channel setup failed:", e);
        }
    }

    // In Expo Go, remote push tokens are limited; we just log and return.
    try {
        const perms = await Notifications.getPermissionsAsync();
        if (perms.status !== "granted") {
            const req = await Notifications.requestPermissionsAsync();
            if (req.status !== "granted") {
                console.log("[Notifications] Permission not granted.");
                return;
            }
        }
    } catch (e) {
        console.log("[Notifications] Permission check failed:", e);
    }
}

// 🔁 Support BOTH:
// import { bootstrap } from "./notifications/bootstrap";
// import bootstrap from "./notifications/bootstrap";
export default bootstrap;
