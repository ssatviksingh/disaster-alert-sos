// backend/src/routes/locationRoutes.ts
import { Router } from "express";
import { updateLocation, getNearby } from "../controllers/LocationController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

// POST /api/location/update  (protected)
router.post("/update", requireAuth, updateLocation);

// GET /api/location/nearby?lat=..&lng=..&rKm=..
router.get("/nearby", requireAuth, getNearby);

export default router;
