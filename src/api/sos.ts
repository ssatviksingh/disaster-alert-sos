// FRONTEND: src/api/sos.ts
import { api } from "./client";

export type SosBackend = {
    _id: string;
    user: string;
    message?: string;
    latitude?: number;
    longitude?: number;
    status: "pending_send" | "sent" | "acknowledged";
    attachments?: string[];
    createdAt: string;
    updatedAt: string;
};

export const sosApi = {
    create: async (body: {
        message?: string;
        latitude?: number;
        longitude?: number;
        status?: SosBackend["status"];
    }) => {
        const res = await api.post<SosBackend>("/api/sos", body);
        return res.data;
    },

    mine: async () => {
        const res = await api.get<SosBackend[]>("/api/sos/mine");
        return res.data;
    },
};
