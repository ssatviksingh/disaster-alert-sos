// src/store/offlineSosStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { v4 as uuidv4 } from "uuid";
import api from "../api/client"; // make sure path correct

const STORAGE_KEY = "offline_sos_queue_v1";

export type OfflineSosItem = {
    tempId: string; // local id
    createdAt: string;
    status: "pending" | "sending" | "sent" | "failed";
    message?: string;
    latitude?: number;
    longitude?: number;
    attachments?: any[]; // minimal for now
    serverId?: string; // set when backend returns official id
};

type Store = {
    queue: OfflineSosItem[];
    init: () => Promise<void>;
    enqueue: (payload: Partial<OfflineSosItem>) => Promise<OfflineSosItem>;
    markSending: (tempId: string) => void;
    markSent: (tempId: string, serverId?: string) => void;
    markFailed: (tempId: string) => void;
    remove: (tempId: string) => void;
    clearAll: () => Promise<void>;
    syncQueue: () => Promise<void>;
};

export const useOfflineSosStore = create<Store>((set, get) => ({
    queue: [],

    init: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            const q: OfflineSosItem[] = raw ? JSON.parse(raw) : [];
            set({ queue: q });
        } catch (e) {
            console.log("[offlineSosStore] init error", e);
            set({ queue: [] });
        }
    },

    enqueue: async (payload) => {
        const item: OfflineSosItem = {
            tempId: uuidv4(),
            createdAt: new Date().toISOString(),
            status: "pending",
            message: payload.message,
            latitude: payload.latitude,
            longitude: payload.longitude,
            attachments: payload.attachments ?? [],
        };
        const next = [item, ...get().queue];
        set({ queue: next });
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch (e) {
            console.log("[offlineSosStore] enqueue save error", e);
        }
        return item;
    },

    markSending: (tempId) => {
        const next = get().queue.map((q) =>
            q.tempId === tempId
                ? { ...q, status: "sending" as const }
                : q
        );
        set({ queue: next });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
    },

    markSent: (tempId, serverId) => {
        const next = get()
            .queue
                .map((q) =>
                    q.tempId === tempId
                        ? { ...q, status: "sent" as const, serverId }
                        : q
                )
                .filter((q): q is OfflineSosItem => q.status !== "sent"); // remove sent entries from queue by default
        set({ queue: next });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
    },

    markFailed: (tempId) => {
        const next = get().queue.map((q) => (
            q.tempId === tempId
                ? { ...q, status: "failed" as const }
                : q
        ));
        set({ queue: next });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
    },

    remove: (tempId) => {
        const next = get().queue.filter((q) => q.tempId !== tempId);
        set({ queue: next });
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => { });
    },

    clearAll: async () => {
        set({ queue: [] });
        try {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } catch { }
    },

    syncQueue: async () => {
        const queue = get().queue.slice(); // copy
        if (!queue.length) return;
        console.log("[offlineSosStore] syncQueue items:", queue.length);

        for (const item of queue) {
            // skip items already sending/sent
            if (item.status === "sending" || item.status === "sent") continue;

            try {
                get().markSending(item.tempId);

                // POST to backend
                // adapt payload keys to your backend model
                const payload: any = {
                    message: item.message,
                    latitude: item.latitude,
                    longitude: item.longitude,
                    status: "pending_send",
                    attachments: item.attachments ?? [],
                };

                const res = await api.post("/api/sos", payload);
                const serverId = res?.data?._id ?? res?.data?.id;
                get().markSent(item.tempId, serverId);
                console.log(`[offlineSosStore] item ${item.tempId} synced -> ${serverId}`);
            } catch (err: any) {
                console.log("[offlineSosStore] sync error for", item.tempId, err?.message ?? err);
                get().markFailed(item.tempId);
                // If unauthorized, auth interceptor will handle logout; stop syncing
                if (err?.response?.status === 401) break;
            }
        }
    },
}));
