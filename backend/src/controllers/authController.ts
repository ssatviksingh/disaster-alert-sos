// backend/src/controllers/authController.ts
import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User, IUser } from "../models/User";
import { ApiError } from "../utils/ApiError";

function signToken(user: IUser): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET not configured");
    }

    return jwt.sign(
        {
            sub: user.id,      // 👈 now TS knows user.id exists
            email: user.email,
        },
        secret,
        { expiresIn: "7d" }
    );
}

// POST /api/auth/register
export const register = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        };

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required.");
        }

        const existing = await User.findOne({ email });
        if (existing) {
            throw new ApiError(409, "A user with this email already exists.");
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: "User", // 🔒 FORCED
            email,
            passwordHash,
        });

        const token = signToken(user);

        return res.status(201).json({
            user: {
                id: user.id,
                name: "User", // 🔒 FORCED
                email: user.email,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};


// POST /api/auth/login
export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { email, password } = req.body as {
            email?: string;
            password?: string;
        };

        if (!email || !password) {
            throw new ApiError(400, "Email and password are required.");
        }

        const user = await User.findOne({ email });
        if (!user) {
            throw new ApiError(401, "Invalid email or password.");
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            throw new ApiError(401, "Invalid email or password.");
        }

        const token = signToken(user);

        return res.json({
            user: {
                id: user.id,
                name: "User", // 🔒 FORCED
                email: user.email,
            },
            token,
        });
    } catch (err) {
        next(err);
    }
};

// GET /api/auth/me
export const me = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authUser = (req as any).user as { id: string; email: string } | undefined;
        if (!authUser) {
            throw new ApiError(401, "Unauthorized");
        }

        const user = await User.findById(authUser.id);
        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.json({
            user: {
                id: user.id,
                name: "User", // 🔒 FORCED
                email: user.email,
            },
        });
    } catch (err) {
        next(err);
    }
};
