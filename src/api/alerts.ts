import { api } from "./client";

export const alertsApi = {
    getAll: () => api.get("/api/alerts"),
    getOne: (id: string) => api.get(`/api/alerts/${id}`),
};
