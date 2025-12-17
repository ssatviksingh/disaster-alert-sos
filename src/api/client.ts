// src/api/client.ts
import axios from "axios";
import Constants from "expo-constants";
import { useAuthStore } from "../store/authStore";
import { Alert } from "react-native";

let baseUrl = (Constants.expoConfig?.extra as any)?.API_URL || "http://10.0.2.2:4000";
if (!baseUrl.startsWith("http")) baseUrl = `http://${baseUrl}`;

console.log("[API] Using base URL:", baseUrl);

export const api = axios.create({
    baseURL: baseUrl,
    timeout: 15000,
});

// attach token if present
api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers = config.headers ?? {};
        (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
});

// response interceptor: handle auth errors centrally
api.interceptors.response.use(
    response => response,
    async (error) => {
        const status = error?.response?.status;
        const msg = error?.response?.data?.error ?? error.message;

        if (status === 401) {
            // clear stored auth immediately
            try {
                const logout = useAuthStore.getState().logout;
                await logout();
            } catch (e) {
                console.log('[API] logout error', e);
            }
            // optional: show a friendly message for interactive dev
            try {
                Alert.alert('Session expired', 'You have been signed out. Please login again.');
            } catch { }
            console.log('[API] 401 response - cleared auth. Msg:', msg);
        }

        return Promise.reject(error);
    }
);

export default api;
