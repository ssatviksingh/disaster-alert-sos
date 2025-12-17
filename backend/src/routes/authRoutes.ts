// backend/src/routes/authRoutes.ts 
import { Router } from "express";
import { register, login, me } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";
import { authLimiter } from "../middleware/rateLimit";

const router = Router();

// POST /api/auth/register 
router.post("/register", authLimiter, register);
// POST /api/auth/login 
router.post("/login", authLimiter, login);
// GET /api/auth/me 
router.get("/me", requireAuth, me);

export default router;