// backend/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError";

export interface AuthUserPayload {
    sub: string;
    email: string;
    iat: number;
    exp: number;
}

export const requireAuth = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return next(new ApiError(401, "Missing Authorization header."));
    }

    const token = header.substring("Bearer ".length);
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        return next(new ApiError(500, "JWT secret not configured."));
    }

    try {
        const payload = jwt.verify(token, secret) as AuthUserPayload;

        (req as any).user = {
            id: payload.sub,
            email: payload.email,
        };

        return next();
    } catch (error) {
        // ✅ We now actually *handle* the exception (log it), then wrap it
        console.error("[Auth] JWT verification failed", error);
        return next(new ApiError(401, "Invalid or expired token."));
    }
};

// Allow default import style as well
export default requireAuth;
