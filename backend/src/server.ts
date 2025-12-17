import { createServer } from 'node:http';
import app from './app';
import { env } from './config/env';
import { connectDb } from './config/db';
import { logger } from './utils/logger';

(async () => {
    try {
        await connectDb();
        logger.info('✅ MongoDB connected');

        const server = createServer(app);

        server.listen(env.PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
})();
