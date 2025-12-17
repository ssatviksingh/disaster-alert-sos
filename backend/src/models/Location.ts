// backend/src/models/Location.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IUserLocation extends Document {
    userId: string;
    latitude: number;
    longitude: number;
}

const LocationSchema = new Schema<IUserLocation>(
    {
        userId: { type: String, required: true, index: true, unique: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    { timestamps: true }
);

export const UserLocation = mongoose.model<IUserLocation>("UserLocation", LocationSchema);
