// backend/src/app.ts
import express from "express";
import cors from "cors";
import morgan from "morgan";

import helmet from "helmet";

import authRoutes from "./routes/authRoutes";
import alertRoutes from "./routes/alertRoutes";
import sosRoutes from "./routes/sosRoutes";
import fileRoutes from "./routes/fileRoutes";
import chatRoutes from "./routes/chatRoutes";
import searchRoutes from "./routes/searchRoutes";
import { errorHandler } from "./middleware/errorHandler";
import locationRoutes from "./routes/LocationRoutes";
import pushRoutes from "./routes/pushRoutes";
import { authLimiter, sosLimiter } from "./middleware/rateLimit";
import aiRoutes from "./routes/aiRoutes";


const app = express();

app.use(helmet());
app.set("trust proxy", 1);

// Core middleware
// Disable ETag to avoid 304 responses that return empty bodies to the mobile app
app.set("etag", false);
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));

// Simple health check
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});



// 🔓 PUBLIC ROUTES (no auth middleware here)
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/search", searchRoutes);

// 🔐 PROTECTED ROUTES
// These routes themselves use `requireAuth` inside their own route files
app.use("/api/sos", sosLimiter, sosRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/ai", aiRoutes);

app.use("/api/location", locationRoutes);
app.use("/api/push", pushRoutes);

// Global error handler
app.use(errorHandler);

export default app;
