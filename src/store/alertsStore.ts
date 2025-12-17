import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { alertsApi } from "../api/alerts";
import * as Notifications from "expo-notifications";

export type AlertItem = {
    _id: string;
    type: string;
    title: string;
    description: string;
    severity: "critical" | "high" | "medium" | "low";
    location: string;
    latitude: number;
    longitude: number;
    createdAt: string;
    updatedAt: string;
};

interface AlertsState {
    alerts: AlertItem[];
    loading: boolean;
    lastUpdated: string | null;
    error: string | null;
    retryCount: number;

    init: () => Promise<void>;
    refresh: (opts?: { silent?: boolean }) => Promise<void>;
}

const STORAGE_KEY = "alerts-cache";
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1500;

/* 🔒 guard */
let isRefreshing = false;

/* ---------- helpers (extracted) ---------- */

const setLoading = (
    set: any,
    silent: boolean,
    loading: boolean,
    error: string | null = null
) => {
    if (!silent) set({ loading, error });
};

const saveCache = (alerts: AlertItem[], lastUpdated: string) => {
    AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ alerts, lastUpdated })
    ).catch(() => { });
};

const sendNotifications = async (
    oldAlerts: AlertItem[],
    newAlerts: AlertItem[]
) => {
    if (oldAlerts.length === 0) return;

    const oldIds = new Set(oldAlerts.map(a => a._id));
    const newItems = newAlerts.filter(a => !oldIds.has(a._id));

    for (const alert of newItems) {
        if (alert.severity === "critical" || alert.severity === "high") {
            try {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: `🚨 ${alert.severity.toUpperCase()}: ${alert.title}`,
                        body: `${alert.location} - ${alert.type}`,
                        data: { alertId: alert._id },
                        sound: true,
                        priority: Notifications.AndroidNotificationPriority.HIGH,
                    },
                    trigger: null,
                });
            } catch { }
        }
    }
};

const handleRetry = (
    attempt: number,
    set: any,
    get: any
) => {
    const nextAttempt = attempt + 1;

    if (nextAttempt <= MAX_RETRIES) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt);

        set({ loading: false, retryCount: nextAttempt });

        setTimeout(() => {
            get().refresh({ silent: true });
        }, delay);
    } else {
        set({
            loading: false,
            retryCount: 0,
            error: "Unable to refresh alerts. Showing last known data.",
        });
    }
};

/* ---------- store ---------- */

export const useAlertsStore = create<AlertsState>((set, get) => ({
    alerts: [],
    loading: false,
    lastUpdated: null,
    error: null,
    retryCount: 0,

    init: async () => {
        try {
            const cached = await AsyncStorage.getItem(STORAGE_KEY);
            if (cached) {
                const parsed = JSON.parse(cached);
                set({
                    alerts: parsed.alerts ?? [],
                    lastUpdated: parsed.lastUpdated ?? null,
                });
            }
        } catch { }

        await get().refresh();
    },

    refresh: async (opts) => {
        if (isRefreshing) return;
        isRefreshing = true;

        const silent = opts?.silent === true;
        const attempt = get().retryCount;

        try {
            setLoading(set, silent, true, null);

            const response = await alertsApi.getAll();
            const newAlerts = response.data as AlertItem[];
            const oldAlerts = get().alerts;

            await sendNotifications(oldAlerts, newAlerts);

            const lastUpdated = new Date().toISOString();

            set({
                alerts: newAlerts,
                loading: false,
                lastUpdated,
                error: null,
                retryCount: 0,
            });

            saveCache(newAlerts, lastUpdated);
        } catch (err) {
            console.error("[Alerts] refresh failed", err);
            handleRetry(attempt, set, get);
        } finally {
            isRefreshing = false;
        }
    },
}));
