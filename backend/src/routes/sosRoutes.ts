// backend/src/routes/sosRoutes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import { createSos, listMySos } from "../controllers/sosController";
import { validate } from "../middleware/validate";
import { createSosSchema } from "../validators/sosValidator";
import { sosLimiter } from "../middleware/rateLimit";

const router = Router();

// Debug log to verify handlers are real functions
console.log(
    "[SosRoutes] handlers:",
    typeof requireAuth,
    typeof createSos,
    typeof listMySos
);

// POST /api/sos  (protected)
router.post("/", requireAuth, createSos);
router.post("/", requireAuth, validate(createSosSchema), createSos);

router.post("/", requireAuth, sosLimiter, validate(createSosSchema), createSos);

// GET /api/sos/mine  (protected)
router.get("/mine", requireAuth, listMySos);

export default router;
