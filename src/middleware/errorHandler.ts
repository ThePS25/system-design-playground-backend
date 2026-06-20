import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorResponse } from '../utils/apiResponse.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.code, err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json(
      errorResponse('VALIDATION_ERROR', 'Invalid request data', err.flatten()),
    );
    return;
  }

  console.error(err);
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json(errorResponse('NOT_FOUND', 'Route not found'));
}
