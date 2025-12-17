// backend/src/routes/chatRoutes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    listThreads,
    getThreadMessages,
    postMessage,
} from "../controllers/chatController";
import { validate } from "../middleware/validate";
import { postMessageSchema } from "../validators/chatSchemas";

const router = Router();

// All chat routes are protected
router.get("/threads", requireAuth, listThreads);
router.get("/threads/:threadId", requireAuth, getThreadMessages);
router.post("/messages", requireAuth, validate(postMessageSchema), postMessage);

export default router;
