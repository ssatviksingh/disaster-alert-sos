// backend/src/models/Alert.ts
import mongoose, { Document, Schema } from 'mongoose';

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low';

/**
 * Plain data interface (DO NOT include Mongoose-specific props like _id or timestamps here).
 */
export interface IAlert {
    type: string;          // e.g. 'earthquake', 'fire'
    title: string;
    description?: string;
    location: string;      // human-readable location string
    latitude: number;
    longitude: number;
    severity: AlertSeverity;
    source?: string;
}

/**
 * Mongoose document type: combines the plain interface with mongoose.Document
 * (Document already declares _id as an ObjectId, timestamps are provided by schema options).
 */
export interface IAlertDocument extends IAlert, Document { }

/**
 * Schema & model
 */
const AlertSchema = new Schema<IAlertDocument>(
    {
        type: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, default: '' },
        location: { type: String, required: true },
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
        severity: { type: String, enum: ['critical', 'high', 'medium', 'low'], required: true },
        source: { type: String, default: 'manual' },
    },
    { timestamps: true }
);

// 🔹 Indexes for alert listing & filtering
AlertSchema.index({ createdAt: -1 });
AlertSchema.index({ severity: 1 });


export const Alert = mongoose.model<IAlertDocument>('Alert', AlertSchema);
export default Alert;
