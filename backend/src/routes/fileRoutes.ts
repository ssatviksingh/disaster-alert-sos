// backend/src/routes/fileRoutes.ts
import { Router } from "express";
import { requireAuth } from "../middleware/authMiddleware";
import {
    createFile,
    listMyFiles,
    getMyFileById,
    deleteMyFileById,
} from "../controllers/fileController";
import { validate } from "../middleware/validate";
import { createFileSchema } from "../validators/fileSchemas";


const router = Router();

// Debug log to verify handlers
console.log(
    "[FileRoutes] handlers:",
    typeof requireAuth,
    typeof createFile,
    typeof listMyFiles,
    typeof getMyFileById,
    typeof deleteMyFileById
);

// POST /api/files
router.post("/", requireAuth, validate(createFileSchema), createFile);

// GET /api/files/mine
router.get("/mine", requireAuth, listMyFiles);

// GET /api/files/mine/:id
router.get("/mine/:id", requireAuth, getMyFileById);

// DELETE /api/files/mine/:id
router.delete("/mine/:id", requireAuth, deleteMyFileById);

export default router;
