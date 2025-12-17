import { api } from "./client";

export const aiApi = {
    chat: async (message: string) => {
        const res = await api.post<{ reply: string }>("/api/ai/chat", { message });
        return res.data.reply;
    },
};
