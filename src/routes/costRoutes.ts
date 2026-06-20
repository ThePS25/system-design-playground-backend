import { Router } from 'express';
import * as costController from '../controllers/costController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { CostCalculateRequestSchema } from '../validators/schemas.js';
import { costLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/calculate',
  costLimiter,
  validateRequest(CostCalculateRequestSchema),
  costController.calculateCost,
);

export default router;
