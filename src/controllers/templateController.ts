import type { Request, Response, NextFunction } from 'express';
import * as templateService from '../services/templateService.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await templateService.listTemplates({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      difficulty: req.query.difficulty as string | undefined,
      tag: req.query.tag as string | undefined,
    });
    res.json(successResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const template = await templateService.getTemplate(String(req.params.id));
    if (!template) {
      throw new AppError(404, 'NOT_FOUND', 'Template not found');
    }
    res.json(successResponse(template));
  } catch (error) {
    next(error);
  }
}
