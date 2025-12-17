import { Request, Response, NextFunction } from "express";
import { searchService } from "../services/searchService";

// 🔎 Public search controller
// - If user is authenticated (req.user exists), we pass user.id
// - If not, we pass null and service handles it gracefully
export const searchAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const qRaw = (req.query.q as string) ?? "";
        const q = qRaw.trim();

        if (!q) {
            // For empty query, just return empty results instead of error
            return res.json({
                alerts: [],
                sos: [],
                files: [],
            });
        }

        // If some middleware set req.user earlier, we can optionally pass it
        const user = (req as any).user as { id?: string } | undefined;
        const userId = user?.id ?? null;

        const result = await searchService.searchAll(userId, q);
        res.json(result);
    } catch (err) {
        next(err);
    }
};
