import type { Request, Response } from 'express';
import { getDatabaseStatus } from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';

export function healthCheck(_req: Request, res: Response): void {
  res.json(
    successResponse({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: getDatabaseStatus(),
    }),
  );
}
