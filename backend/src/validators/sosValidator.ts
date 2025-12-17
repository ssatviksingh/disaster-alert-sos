import { z } from "zod";

export const createSosSchema = z.object({
    type: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    location: z.string().min(1),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    severity: z.enum(["critical", "high", "medium", "low"]),
});
