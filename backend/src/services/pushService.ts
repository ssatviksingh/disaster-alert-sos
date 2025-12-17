// backend/src/services/pushService.ts
export async function sendExpoPush(
    to: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
) {
    if (!to.startsWith("ExponentPushToken")) {
        console.warn("[Push] Invalid Expo token", to);
        return;
    }

    const response = await fetch("https://exp.host/--/api/v2/push/send", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            to,
            sound: "default",
            title,
            body,
            data,
        }),
    });

    const json = await response.json();
    if (!response.ok || json?.errors) {
        console.error("[Push] Error sending push", json);
        throw new Error("Failed to send push notification");
    }

    return json;
}
