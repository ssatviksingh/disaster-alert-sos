import { Router } from "express";
import requireAuth from "../middleware/authMiddleware";
import { chatWithAI } from "../controllers/aiController";

const router = Router();

router.post("/chat", requireAuth, chatWithAI);

export default router;
