import { NextFunction, Request, Response } from 'express';
import { request } from 'http';
import { v4 as uuidv4 } from 'uuid';

export const requestIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const requestId = uuidv4();
  (req as any).requestId = requestId;

  //optional set header so client also gets it ????
  res.setHeader('X-Request-Id', requestId);
  next();
};
