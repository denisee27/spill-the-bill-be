import { AppError } from '../../core/errors/http-errors.js';
import logger from '../../infra/logger/index.js';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof AppError) {
    logger.warn({ err, path: req.path, method: req.method }, err.message);
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
};
