import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { AppError } from './errorHandler.js';

type RequestSource = 'body' | 'query' | 'params';

export function validateRequest(schema: ZodSchema, source: RequestSource = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      next(new AppError(400, 'VALIDATION_ERROR', 'Invalid request data', result.error.flatten()));
      return;
    }
    req[source] = result.data;
    next();
  };
}
