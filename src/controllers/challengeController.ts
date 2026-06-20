import type { Request, Response, NextFunction } from 'express';
import * as challengeService from '../services/challengeService.js';
import { successResponse } from '../utils/apiResponse.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listChallenges(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await challengeService.listChallenges({
      difficulty: req.query.difficulty as string | undefined,
    });
    res.json(successResponse(result.data, result.meta));
  } catch (error) {
    next(error);
  }
}

export async function getChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const challenge = await challengeService.getChallenge(String(req.params.id));
    if (!challenge) {
      throw new AppError(404, 'NOT_FOUND', 'Challenge not found');
    }
    res.json(successResponse(challenge));
  } catch (error) {
    next(error);
  }
}

export async function validateChallenge(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await challengeService.validateChallengeSubmission(req.body);
    res.json(successResponse(result));
  } catch (error) {
    next(error);
  }
}
