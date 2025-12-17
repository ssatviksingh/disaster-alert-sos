// src/store/settingsStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { nanoid } from "nanoid/non-secure";

const CONTACTS_KEY = "emergency_contacts_v1";
const SETTINGS_KEY = "app_settings_v1";

export type EmergencyContact = {
    id: string;
    name: string;
    phone: string;
    relation?: string;
};

export type AppSettings = {
    darkMode: boolean;
    largeText: boolean;
    highContrast: boolean;
};

type SettingsState = {
    // contacts
    contacts: EmergencyContact[];
    initContacts: () => Promise<void>;
    addContact: (contact: Omit<EmergencyContact, "id">) => Promise<void>;
    removeContact: (id: string) => Promise<void>;
    clearContacts: () => Promise<void>;

    // app settings
    settings: AppSettings | null; // start null until loaded
    initSettings: () => Promise<void>;
    init: () => Promise<void>; // alias for compatibility
    toggleDarkMode: () => Promise<void>;
    toggleLargeText: () => Promise<void>;
    toggleHighContrast: () => Promise<void>;
    setSettings: (s: AppSettings) => Promise<void>;
};

export const defaultSettings: AppSettings = {
    darkMode: true,
    largeText: false,
    highContrast: false,
};

const safeNanoId = () => {
    try {
        return nanoid();
    } catch {
        return String(Date.now());
    }
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
    // ---------- contacts ----------
    contacts: [],

    initContacts: async () => {
        try {
            const raw = await AsyncStorage.getItem(CONTACTS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (Array.isArray(parsed)) {
                    set({ contacts: parsed });
                } else {
                    set({ contacts: [] });
                }
            } else {
                set({ contacts: [] });
            }
        } catch (e) {
            console.log("[settingsStore] initContacts error:", e);
            set({ contacts: [] });
        }
    },

    addContact: async (contact) => {
        const newContact: EmergencyContact = {
            id: safeNanoId(),
            ...contact,
        };
        const updated = [newContact, ...get().contacts];
        set({ contacts: updated });
        try {
            await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log("[settingsStore] addContact error:", e);
        }
    },

    removeContact: async (id) => {
        const updated = get().contacts.filter((c) => c.id !== id);
        set({ contacts: updated });
        try {
            await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.log("[settingsStore] removeContact error:", e);
        }
    },

    clearContacts: async () => {
        set({ contacts: [] });
        try {
            await AsyncStorage.removeItem(CONTACTS_KEY);
        } catch (e) {
            console.log("[settingsStore] clearContacts error:", e);
        }
    },

    // ---------- settings ----------
    settings: null,

    initSettings: async () => {
        try {
            const raw = await AsyncStorage.getItem(SETTINGS_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                set({ settings: { ...defaultSettings, ...parsed } });
            } else {
                // persist default immediately
                await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(defaultSettings));
                set({ settings: defaultSettings });
            }
        } catch (e) {
            console.log("[settingsStore] initSettings error:", e);
            set({ settings: defaultSettings });
        }
    },

    // alias for older callers that expect `init()`
    init: async () => {
        await get().initSettings();
        await get().initContacts();
    },

    setSettings: async (s) => {
        set({ settings: s });
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
        } catch (e) {
            console.log("[settingsStore] setSettings error:", e);
        }
    },

    toggleDarkMode: async () => {
        const cur = get().settings ?? defaultSettings;
        const next = { ...cur, darkMode: !cur.darkMode };
        set({ settings: next });
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } catch (e) {
            console.log("[settingsStore] toggleDarkMode error:", e);
        }
    },

    toggleLargeText: async () => {
        const cur = get().settings ?? defaultSettings;
        const next = { ...cur, largeText: !cur.largeText };
        set({ settings: next });
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } catch (e) {
            console.log("[settingsStore] toggleLargeText error:", e);
        }
    },

    toggleHighContrast: async () => {
        const cur = get().settings ?? defaultSettings;
        const next = { ...cur, highContrast: !cur.highContrast };
        set({ settings: next });
        try {
            await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        } catch (e) {
            console.log("[settingsStore] toggleHighContrast error:", e);
        }
    },
}));
