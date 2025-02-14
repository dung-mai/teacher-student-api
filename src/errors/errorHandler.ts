import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from '../config/logger';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If we already responded, do nothing
  if (res.headersSent) return next(err);

  let statusCode = 500;
  let message = 'Internal Server Error';
  let details = undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode || 500;
    message = err.message;
    details = err.details;
  }

  logger.error('ErrorHandler', {
    message: err.message,
    stack: err.stack,
    statusCode,
    details,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(statusCode).json({
    message,
    details,
  });
}
