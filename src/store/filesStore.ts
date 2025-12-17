import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FileItem, filesApi } from "../api/files";

interface FilesState {
    items: FileItem[];
    loading: boolean;
    filter: "all" | "document" | "image" | "video" | "other";

    init: () => Promise<void>;
    refresh: () => Promise<void>;
    addSamples: () => Promise<void>;
    uploadFile: (file: {
        name: string;
        type: FileItem["type"];
        sizeBytes: number;
        uri: string;
        tags?: string[];
        category?: string;
    }) => Promise<void>;
    setFilter: (f: FilesState["filter"]) => void;
    getById: (id: string) => FileItem | undefined;
    deleteFile: (id: string) => Promise<void>;
}

const STORAGE_KEY = "files-cache";

export const useFilesStore = create<FilesState>((set, get) => ({
    items: [],
    loading: false,
    filter: "all",

    init: async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw) as { items: FileItem[] };
                set({ items: parsed.items || [] });
            }
        } catch { }

        await get().refresh();
    },

    refresh: async () => {
        try {
            set({ loading: true });
            const items = await filesApi.getMine();
            set({ items, loading: false });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items })).catch(() => { });
        } catch (err) {
            console.log("[Files] refresh error", err);
            set({ loading: false });
        }
    },

    addSamples: async () => {
        try {
            set({ loading: true });
            await filesApi.createSampleSet();
            const items = await filesApi.getMine();
            set({ items, loading: false });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items })).catch(() => { });
        } catch (err) {
            console.log("[Files] addSamples error", err);
            set({ loading: false });
        }
    },

    uploadFile: async (file) => {
        try {
            set({ loading: true });

            await filesApi.create({
                name: file.name,
                type: file.type,
                sizeBytes: file.sizeBytes,
                tags: file.tags || [],
                url: file.uri, // still mock, backend later
            });

            const items = await filesApi.getMine();
            set({ items, loading: false });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items })).catch(() => { });
        } catch (err) {
            console.log("[Files] uploadFile error", err);
            set({ loading: false });
            throw err;
        }
    },

    setFilter: (f) => set({ filter: f }),

    getById: (id) => get().items.find((f) => f._id === id),

    deleteFile: async (id) => {
        try {
            set({ loading: true });
            await filesApi.deleteOne(id);
            const updated = get().items.filter((f) => f._id !== id);
            set({ items: updated, loading: false });
            AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ items: updated })).catch(
                () => { }
            );
        } catch (err) {
            console.log("[Files] delete error", err);
            set({ loading: false });
            throw err;
        }
    },
}));
