import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { navigationRef } from "../navigation/navigationRef";

export const useNotificationHandler = () => {
    useEffect(() => {
        // Foreground notification
        const receivedSub =
            Notifications.addNotificationReceivedListener(() => {
                console.log("[Notification] received in foreground");
            });

        // Notification tap (background / killed)
        const responseSub =
            Notifications.addNotificationResponseReceivedListener((res) => {
                const data = res.notification.request.content.data;
                if (data?.screen && navigationRef.isReady()) {
                    navigationRef.navigate(data.screen as never);
                }
            });

        return () => {
            receivedSub.remove();
            responseSub.remove();
        };
    }, []);
};
