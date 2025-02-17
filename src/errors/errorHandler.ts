import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { logger } from '../config/logger';
import { StatusCodes } from 'http-status-codes';
import { INTERNAL_SERVER_ERROR } from '../constants/messages.constants';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // If response has already send, do nothing
  if (res.headersSent) return next(err);

  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = INTERNAL_SERVER_ERROR;
  let errors = null;

  if (err instanceof AppError) {
    statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    message = err.message;
    errors = err.details;
  }

  logger.error(`[${req.method}] ${req.originalUrl}`, {
    statusCode,
    message: err.message,
    requestId: (req as any).requestId,
    stack: err.stack,
  });

  res.status(statusCode).json({
    message,
    errors,
  });
}
