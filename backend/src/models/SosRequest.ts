// backend/src/models/SosRequest.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type SosStatus = "pending_send" | "sent" | "failed";

export interface ISosRequest extends Document {
    id: string;
    user: Types.ObjectId;
    message?: string;
    latitude?: number;
    longitude?: number;
    status: SosStatus;
    attachments: any[];
    createdAt: Date;
    updatedAt: Date;
}

const SosRequestSchema = new Schema<ISosRequest>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        message: { type: String },
        latitude: { type: Number },
        longitude: { type: Number },
        status: {
            type: String,
            enum: ["pending_send", "sent", "failed"],
            default: "pending_send",
        },
        // 👇 TS-safe, runtime OK
        attachments: {
            type: [Schema.Types.Mixed],
            default: [] as any[],
        } as any,
    },
    { timestamps: true }
);

export const SosRequest = mongoose.model<ISosRequest>(
    "SosRequest",
    SosRequestSchema
);
