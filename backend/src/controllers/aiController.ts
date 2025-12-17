import { Request, Response } from "express";
import { ApiError } from "../utils/ApiError";
import { aiChat } from "../services/aiService";

export const chatWithAI = async (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
        throw ApiError.badRequest("Message is required");
    }

    const reply = await aiChat(message);

    res.json({
        reply,
    });
};
