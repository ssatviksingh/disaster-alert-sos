// backend/src/models/User.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    id: string; // 👈 explicitly add id so TS is happy
    name: string;
    email: string;
    passwordHash: string;
    expoPushToken?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        expoPushToken: { type: String },
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
