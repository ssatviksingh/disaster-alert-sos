import { z } from "zod";

export const postMessageSchema = z.object({
    message: z.string().min(1),
    threadId: z.string().optional(),
    to: z.string().optional(),
});
