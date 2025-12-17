// backend/src/models/FileAsset.ts
import mongoose, { Schema, Document, Types } from "mongoose";

export type FileKind = "image" | "video" | "audio" | "document" | "other";

export interface IFileAsset extends Document {
    id: string;
    user: Types.ObjectId;
    name: string;
    type: FileKind;
    sizeBytes: number;
    sizeLabel: string;
    tags: string[];
    url: string;
    createdAt: Date;
    updatedAt: Date;
}

const FileAssetSchema = new Schema<IFileAsset>(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true },
        name: { type: String, required: true },
        type: {
            type: String,
            enum: ["image", "video", "audio", "document", "other"],
            default: "other",
        },
        sizeBytes: { type: Number, required: true },
        sizeLabel: { type: String, required: true },
        tags: { type: [String], default: [] },
        url: { type: String, required: true },
    },
    { timestamps: true }
);

// 🔹 Index for fast user file queries
FileAssetSchema.index({ user: 1, createdAt: -1 });


export const FileAsset = mongoose.model<IFileAsset>(
    "FileAsset",
    FileAssetSchema
);
