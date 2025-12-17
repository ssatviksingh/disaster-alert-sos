// FRONTEND: src/api/auth.ts
import { api } from "./client";

export type AuthUser = {
    id: string;
    name: string;
    email: string;
};

type RawUser = {
    _id?: string;
    id?: string;
    name: string;
    email: string;
};

type AuthResponse = {
    user: RawUser;
    token: string;
};

export const authApi = {
    login: async (body: { email: string; password: string }) => {
        const res = await api.post<AuthResponse>("/api/auth/login", body);
        return res.data;
    },

    register: async (body: { name: string; email: string; password: string }) => {
        const res = await api.post<AuthResponse>("/api/auth/register", body);
        return res.data;
    },
};
