import type { Request, Response, NextFunction } from 'express';
import * as savedDesignService from '../services/savedDesignService.js';
import { successResponse } from '../utils/apiResponse.js';

export async function saveDesign(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savedDesignService.saveDesign(req.body);
    res.status(201).json(successResponse(result));
  } catch (error) {
    next(error);
  }
}

export async function listSavedDesigns(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await savedDesignService.listSavedDesigns({
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 20,
      userId: req.query.userId as string | undefined,
      module: req.query.module as string | undefined,
    });
    res.json(successResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}
