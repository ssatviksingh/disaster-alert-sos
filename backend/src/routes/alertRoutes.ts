// backend/src/routes/alertRoutes.ts
import { Router } from "express";
import * as alertController from "../controllers/alertController";

const router = Router();

// Destructure handlers from the imported module
const {
    createAlert,
    listAlerts,
    getAlertById,
} = alertController;

// For now, keep alerts open (no auth). We can add requireAuth later.
// POST /api/alerts
router.post("/", createAlert);

// GET /api/alerts
router.get("/", listAlerts);

// GET /api/alerts/:id
router.get("/:id", getAlertById);

export default router;
