import dotenv from 'dotenv';

dotenv.config();
console.log("[ENV CHECK]", process.env.OPENROUTER_API_KEY);

export const env = {
    NODE_ENV: process.env.NODE_ENV ?? 'development',
    PORT: Number.parseInt(process.env.PORT ?? '4000', 10),

    // ✅ Always a valid Mongo URI (even if .env is missing)
    MONGO_URI: process.env.MONGO_URI ?? 'mongodb://127.0.0.1:27017/disaster_sos',

    // ✅ Dev fallback so the app still runs (change in production)
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-me',

    CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? '*',

    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
};

if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing in environment");
}

