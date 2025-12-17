import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../api/client";
import { nanoid } from "nanoid/non-secure";

const STORAGE_KEY = "sos_queue_v1";

export type SosStatus = "pending_send" | "sending" | "sent" | "failed";

export type SosItem = {
    id: string;
    serverId?: string;
    user?: string;
    createdAt: string;
    message?: string;
    latitude?: number;
    longitude?: number;
    status: SosStatus;
    meta?: {
        attachments?: string[]; // 🔗 file IDs
        [key: string]: any;
    };
};

type SosState = {
    items: SosItem[];
    loading: boolean;

    init: () => Promise<void>;
    sendSos: (payload: {
        message?: string;
        latitude?: number;
        longitude?: number;
        meta?: Record<string, any>;
    }) => Promise<SosItem>;

    markAsSent: (localId: string, serverId?: string) => void;
    markFailed: (localId: string) => void;

    toggleAttachment: (fileId: string) => void;
    isAttached: (fileId: string) => boolean;

    retryPending: () => Promise<void>;
    clearHistory: () => Promise<void>;
};

const safeNanoId = () => {
    try {
        return nanoid();
    } catch {
        return String(Date.now());
    }
};

export const useSosStore = create<SosState>((set, get) => ({
    items: [],
    loading: false,

    init: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as SosItem[];
                set({ items: Array.isArray(parsed) ? parsed : [] });
            }
        } catch {
            set({ items: [] });
        }
    },

    sendSos: async ({ message, latitude, longitude, meta }) => {
        const localId = safeNanoId();

        const item: SosItem = {
            id: localId,
            createdAt: new Date().toISOString(),
            message,
            latitude,
            longitude,
            status: "pending_send",
            meta: meta ?? {},
        };

        set((s) => ({ items: [item, ...s.items] }));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(get().items)).catch(
            () => { }
        );

        try {
            set({ loading: true });

            set((s) => ({
                items: s.items.map((it) =>
                    it.id === localId
                        ? { ...it, status: "sending" as SosStatus }
                        : it
                ),
            }));

            const res = await api.post("/api/sos", {
                message,
                latitude,
                longitude,
                attachments: item.meta?.attachments ?? [],
                meta: item.meta ?? {},
            });

            const serverId = res?.data?._id ?? res?.data?.id;
            get().markAsSent(localId, serverId);

            return { ...item, status: "sent", serverId };
        } catch (e) {
            get().markFailed(localId);
            throw e;
        } finally {
            set({ loading: false });
        }
    },

    markAsSent: (localId, serverId) => {
        set((s) => {
            const items: SosItem[] = s.items.map((it) =>
                it.id === localId
                    ? { ...it, status: "sent", serverId }
                    : it
            );
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => { });
            return { items };
        });
    },

    markFailed: (localId) => {
        set((s) => {
            const items: SosItem[] = s.items.map((it) =>
                it.id === localId
                    ? { ...it, status: "failed" }
                    : it
            );
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => { });
            return { items };
        });
    },

    toggleAttachment: (fileId) => {
        set((s) => {
            if (s.items.length === 0) return s;

            const current = s.items[0];
            const existing = current.meta?.attachments ?? [];

            const attachments = existing.includes(fileId)
                ? existing.filter((id) => id !== fileId)
                : [...existing, fileId];

            const updated: SosItem = {
                ...current,
                meta: { ...current.meta, attachments },
            };

            const items: SosItem[] = [updated, ...s.items.slice(1)];
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => { });
            return { items };
        });
    },

    isAttached: (fileId) => {
        const items = get().items;
        return items[0]?.meta?.attachments?.includes(fileId) ?? false;
    },

    retryPending: async () => {
        const snapshot = [...get().items];

        for (const it of snapshot.filter(
            (i) => i.status === "pending_send" || i.status === "failed"
        )) {
            try {
                set((s) => ({
                    items: s.items.map((x) =>
                        x.id === it.id ? { ...x, status: "sending" } : x
                    ),
                }));

                const res = await api.post("/api/sos", {
                    message: it.message,
                    latitude: it.latitude,
                    longitude: it.longitude,
                    attachments: it.meta?.attachments ?? [],
                    meta: it.meta ?? {},
                });

                get().markAsSent(it.id, res?.data?._id);
            } catch {
                get().markFailed(it.id);
            }
        }
    },

    clearHistory: async () => {
        set({ items: [] });
        await AsyncStorage.removeItem(STORAGE_KEY).catch(() => { });
    },
}));
