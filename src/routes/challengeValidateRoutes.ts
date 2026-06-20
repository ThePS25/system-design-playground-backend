import { Router } from 'express';
import * as challengeController from '../controllers/challengeController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ValidateChallengeRequestSchema } from '../validators/schemas.js';
import { challengeLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/validate',
  challengeLimiter,
  validateRequest(ValidateChallengeRequestSchema),
  challengeController.validateChallenge,
);

export default router;
