// backend/src/controllers/chatController.ts
import { RequestHandler } from "express";
import { Types } from "mongoose";
import { ChatMessage } from "../models/ChatMessage";
import { ApiError } from "../utils/ApiError";

// GET /api/chat/threads
// Returns a list of threads for the current user, with last message preview
export const listThreads: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const userId = new Types.ObjectId(authUser.id);

        // Aggregate threads: one entry per threadId, with latest message
        const threads = await ChatMessage.aggregate([
            { $match: { user: userId } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$threadId",
                    lastMessage: { $first: "$content" },
                    lastRole: { $first: "$role" },
                    lastAt: { $first: "$createdAt" },
                },
            },
            { $sort: { lastAt: -1 } },
            { $limit: 50 },
        ]);

        const mapped = threads.map((t) => ({
            threadId: t._id as string,
            lastMessage: t.lastMessage as string,
            lastRole: t.lastRole as "user" | "assistant",
            lastAt: t.lastAt as Date,
        }));

        res.json(mapped);
    } catch (err) {
        next(err);
    }
};

// GET /api/chat/threads/:threadId
// Returns all messages for a given thread (for current user)
export const getThreadMessages: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { threadId } = req.params;
        if (!threadId) {
            throw new ApiError(400, "threadId is required.");
        }

        const messages = await ChatMessage.find({
            user: authUser.id,
            threadId,
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (err) {
        next(err);
    }
};

// POST /api/chat/messages
// Body: { threadId?: string, message: string }
// - If threadId is not provided, we create a new thread ID
// - Store user message
// - Store assistant reply (static safety text for now)
// - Return { threadId, messages: [userMsg, assistantMsg] }
export const postMessage: RequestHandler = async (req, res, next) => {
    try {
        const authUser = (req as any).user as { id: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const { threadId, message } = req.body as {
            threadId?: string;
            message?: string;
        };

        if (!message || !message.trim()) {
            throw new ApiError(400, "Message is required.");
        }

        const normalizedThreadId = threadId || new Types.ObjectId().toString();

        // 1) Save user message
        const userMsg = await ChatMessage.create({
            user: authUser.id,
            threadId: normalizedThreadId,
            role: "user",
            content: message.trim(),
        });

        // 2) Generate a SAFE assistant response (no real AI yet)
        const assistantText =
            "🛡️ I'm your safety assistant. I can help you think through safety steps, " +
            "but I can't replace real emergency services. " +
            "If you are in immediate danger, contact your local emergency number (like 112/911) right now.";

        const assistantMsg = await ChatMessage.create({
            user: authUser.id,
            threadId: normalizedThreadId,
            role: "assistant",
            content: assistantText,
        });

        res.status(201).json({
            threadId: normalizedThreadId,
            messages: [userMsg, assistantMsg],
        });
    } catch (err) {
        next(err);
    }
};
