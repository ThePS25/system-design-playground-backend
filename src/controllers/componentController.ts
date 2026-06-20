import type { Request, Response, NextFunction } from 'express';
import * as componentService from '../services/componentService.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listComponents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await componentService.listComponents({
      category: req.query.category as string | undefined,
      search: req.query.search as string | undefined,
    });
    res.json(successResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getComponent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const component = await componentService.getComponent(String(req.params.id));
    if (!component) {
      throw new AppError(404, 'NOT_FOUND', 'Component not found');
    }
    res.json(successResponse(component));
  } catch (error) {
    next(error);
  }
}
