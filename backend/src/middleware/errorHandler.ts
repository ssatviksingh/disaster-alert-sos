import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

export const errorHandler = (
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) => {
    // Handle our explicit ApiError
    if (err instanceof ApiError) {
        if (process.env.NODE_ENV !== 'test') {
            logger.error('ApiError:', err.statusCode, err.message, err.details || '');
        }
        return res.status(err.statusCode).json({
            error: err.message,
            details: err.details,
        });
    }

    // Handle Mongo invalid ObjectId
    if (err?.name === 'CastError' && err?.kind === 'ObjectId') {
        return res.status(400).json({
            error: 'Invalid ID format.',
        });
    }

    logger.error('Unexpected error:', err);
    return res.status(500).json({
        error: 'Internal server error',
    });
};
