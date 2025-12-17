// backend/src/models/ChatMessage.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type ChatRole = "user" | "assistant";

export interface IChatMessage extends Document {
    id: string;
    user: Types.ObjectId;
    threadId: string;
    role: ChatRole;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        threadId: { type: String, required: true },
        role: { type: String, enum: ["user", "assistant"], required: true },
        content: { type: String, required: true },
    },
    { timestamps: true }
);

// 🔹 Index for fast thread message retrieval
ChatMessageSchema.index({ threadId: 1, createdAt: 1 });


export const ChatMessage = mongoose.model<IChatMessage>(
    "ChatMessage",
    ChatMessageSchema
);
