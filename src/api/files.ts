import { api } from "./client";

export type FileItem = {
    _id: string;
    user?: string;
    name: string;
    type: "document" | "image" | "video" | "other";
    sizeBytes: number;
    sizeLabel: string;
    tags: string[];
    url: string;
    createdAt: string;
    updatedAt: string;
};

export const filesApi = {
    getMine: async () => {
        const res = await api.get<FileItem[]>("/api/files/mine");
        return res.data;
    },

    getOne: async (id: string) => {
        const res = await api.get<FileItem>(`/api/files/mine/${id}`);
        return res.data;
    },

    deleteOne: async (id: string) => {
        const res = await api.delete<{ deleted: boolean }>(`/api/files/mine/${id}`);
        return res.data;
    },

    create: async (payload: {
        name: string;
        type: FileItem["type"];
        sizeBytes: number;
        tags: string[];
        url: string;
    }) => {
        const res = await api.post<FileItem>("/api/files", payload);
        return res.data;
    },

    // helper to create 3 demo files
    createSampleSet: async () => {
        const samples = [
            {
                name: "Home evacuation plan.pdf",
                type: "document" as const,
                sizeBytes: 220 * 1024,
                tags: ["home", "family", "fire"],
                url: "https://example.com/mock/home-evacuation-plan.pdf",
            },
            {
                name: "Medical ID card.jpg",
                type: "image" as const,
                sizeBytes: 350 * 1024,
                tags: ["id", "medical"],
                url: "https://example.com/mock/medical-id.jpg",
            },
            {
                name: "Emergency contacts.txt",
                type: "document" as const,
                sizeBytes: 12 * 1024,
                tags: ["contacts", "phone"],
                url: "https://example.com/mock/emergency-contacts.txt",
            },
        ];

        const created: FileItem[] = [];
        for (const sample of samples) {
            // ignore individual errors so one bad sample doesn't break all
            try {
                const f = await filesApi.create(sample);
                created.push(f);
            } catch (e) {
                console.log("[Files] failed to create sample", sample.name, e);
            }
        }
        return created;
    },
};
