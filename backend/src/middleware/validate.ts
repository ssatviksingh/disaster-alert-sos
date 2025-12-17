import { Request, Response, NextFunction } from "express";
import { ZodType } from "zod";
import { ApiError } from "../utils/ApiError";

export const validate =
    <T>(schema: ZodType<T>) =>
        (req: Request, _res: Response, next: NextFunction) => {
            const result = schema.safeParse(req.body);

            if (!result.success) {
                throw ApiError.badRequest(
                    "Validation failed",
                    result.error.issues
                );
            }

            req.body = result.data;
            next();
        };
