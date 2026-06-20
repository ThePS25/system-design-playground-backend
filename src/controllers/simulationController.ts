import type { Request, Response, NextFunction } from 'express';
import * as simulationService from '../services/simulationService.js';
import { successResponse } from '../utils/apiResponse.js';

export async function runSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await simulationService.runTrafficSimulation(req.body);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}
