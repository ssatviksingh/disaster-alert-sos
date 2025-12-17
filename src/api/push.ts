// src/api/push.ts
import { api } from "./client";

export const pushApi = {
    registerToken: (token: string) =>
        api.post("/api/push/token", { token }) as Promise<{ ok: boolean }>,
};
