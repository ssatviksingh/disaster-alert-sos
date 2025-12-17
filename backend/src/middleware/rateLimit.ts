import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

export const sosLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
});
