// backend/src/services/searchService.ts
import { Alert } from "../models/Alert";
import { SosRequest } from "../models/SosRequest";
import { FileAsset } from "../models/FileAsset";

export const searchService = {
    // userId can be null when called from public /api/search
    searchAll: async (userId: string | null, q: string) => {
        const regex = new RegExp(q, "i");

        // 🔔 Search public alerts
        const alerts = await Alert.find({
            $or: [
                { title: regex },
                { description: regex },
                { location: regex },
                { type: regex },
            ],
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();

        let sos: any[] = [];
        let files: any[] = [];

        // If we DO have a user, we can also search their SOS + files
        if (userId) {
            sos = await SosRequest.find({
                user: userId,
                $or: [{ message: regex }],
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();

            files = await FileAsset.find({
                user: userId,
                $or: [{ name: regex }, { tags: regex }],
            })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean();
        }

        return {
            alerts,
            sos,
            files,
        };
    },
};
