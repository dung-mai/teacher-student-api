import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { BadRequestError } from '../errors/BadRequestError';
import { VALIDATION_ERROR } from '../constants';

/**
 * Generic middleware that validates req.body, req.query, req.params
 * based on a Zod schema with shape { body?: z.ZodObject, query?: ..., params?: ... }
 */
export const validatePayload = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestError('Validation error', error.issues);
      }
      return next(error);
    }
  };
};
