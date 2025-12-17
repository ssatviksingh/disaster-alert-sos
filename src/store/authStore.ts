// src/store/authStore.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authApi } from "../api/auth";

type User = {
    id?: string;
    name?: string;
    email?: string;
};

interface AuthState {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
    initializing: boolean;
    login: (email: string, password: string) => Promise<void>;
    setAuth: (user: User, token: string) => Promise<void>;
    loadStoredAuth: () => Promise<void>;
    logout: () => Promise<void>;
    bootstrap: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: null,
    loading: false,
    error: null,
    initializing: true,

    login: async (email: string, password: string) => {
        try {
            set({ loading: true, error: null });

            const response = await authApi.login({ email, password });

            const user: User = {
                id: response.user.id || response.user._id,
                name: "User",                 // 🔒 force
                email: response.user.email,
            };

            await get().setAuth(user, response.token);
            set({ loading: false, error: null, initializing: false });
        } catch (e: any) {
            const errorMsg =
                e?.response?.data?.error ||
                e?.message ||
                "Login failed. Please try again.";

            set({ loading: false, error: errorMsg, initializing: false });
            throw new Error(errorMsg);
        }
    },

    setAuth: async (user, token) => {
        const safeUser = {
            ...user,
            name: "User",                  // 🔒 sanitize
        };

        try {
            await AsyncStorage.setItem("auth_token", token);
            await AsyncStorage.setItem("auth_user", JSON.stringify(safeUser));
            set({ user: safeUser, token, error: null, initializing: false });
        } catch (e) {
            console.log("[authStore] setAuth error", e);
            set({ user: safeUser, token, error: null, initializing: false });
        }
    },

    loadStoredAuth: async () => {
        try {
            const token = await AsyncStorage.getItem("auth_token");
            const userStr = await AsyncStorage.getItem("auth_user");

            const parsed = userStr ? JSON.parse(userStr) : null;

            const user = parsed
                ? { ...parsed, name: "User" }   // 🔒 sanitize old data
                : null;

            set({ token, user, loading: false, initializing: false });
        } catch (e) {
            console.log("[authStore] loadStoredAuth error", e);
            set({ token: null, user: null, loading: false, initializing: false });
        }
    },

    logout: async () => {
        try {
            await AsyncStorage.removeItem("auth_token");
            await AsyncStorage.removeItem("auth_user");
        } catch (e) {
            console.error("[authStore] logout error:", e);
        }
        set({ user: null, token: null, error: null });
    },

    bootstrap: async () => {
        await get().loadStoredAuth();
    },
}));
