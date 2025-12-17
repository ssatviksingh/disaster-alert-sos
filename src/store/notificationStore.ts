// FRONTEND: src/store/notificationStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { pushApi } from "../api/push";

type NotificationState = {
    pushToken: string | null;
    syncing: boolean;
    setAndSyncToken: (token: string) => Promise<void>;
    hydrate: () => Promise<void>;
};

const STORAGE_KEY = "push-token";

export const useNotificationStore = create<NotificationState>((set, get) => ({
    pushToken: null,
    syncing: false,

    hydrate: async () => {
        try {
            const stored = await AsyncStorage.getItem(STORAGE_KEY);
            if (stored) {
                set({ pushToken: stored });
            }
        } catch (e) {
            console.log("[Notifications] hydrate error", e);
        }
    },

    setAndSyncToken: async (token: string) => {
        try {
            set({ syncing: true });
            await AsyncStorage.setItem(STORAGE_KEY, token);
            set({ pushToken: token });
            await pushApi.registerToken(token);
            set({ syncing: false });
        } catch (e) {
            console.log("[Notifications] failed to sync token", e);
            set({ syncing: false });
        }
    },
}));
