import { z } from "zod";

export const createFileSchema = z.object({
    name: z.string().min(1),
    type: z.enum(["image", "video", "audio", "document", "other"]).optional(),
    sizeBytes: z.number().positive(),
    tags: z.array(z.string()).optional(),
    url: z.string().pipe(z.string().url()),
});
