// backend/src/routes/searchRoutes.ts
import { Router } from "express";
import { searchAll } from "../controllers/searchController";
import requireAuth from "../middleware/authMiddleware";

const router = Router();

/**
 * 🔓 Public search endpoint
 *
 * For now, search does NOT require authentication.
 * This avoids JWT issues while you're still wiring up frontend auth.
 * Later, if you want to protect it, you can add `requireAuth` back in.
 */
// Require auth so we can return user-specific SOS/files; still returns public alerts
router.get("/", requireAuth, searchAll);

export default router;
