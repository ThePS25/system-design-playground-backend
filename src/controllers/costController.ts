import type { Request, Response, NextFunction } from 'express';
import * as costService from '../services/costService.js';
import { successResponse } from '../utils/apiResponse.js';

export async function calculateCost(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = costService.calculateInfrastructureCost(req.body);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}
