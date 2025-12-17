// backend/src/routes/pushRoutes.ts
import { Router } from "express";
import { registerPushToken, sendTestNotification } from "../controllers/pushController";
import requireAuth from "../middleware/authMiddleware";
import { validate } from "../middleware/validate";
import { registerPushSchema } from "../validators/pushSchemas";


const router = Router();

router.post("/token", requireAuth, validate(registerPushSchema), registerPushToken);
router.post("/test", requireAuth, sendTestNotification);

export default router;
