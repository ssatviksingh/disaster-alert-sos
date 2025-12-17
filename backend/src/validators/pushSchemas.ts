import { z } from "zod";

export const registerPushSchema = z.object({
    token: z.string().min(10),
});
