import { Router } from 'express';
import * as simulationController from '../controllers/simulationController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { SimulationRequestSchema } from '../validators/schemas.js';
import { simulationLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post(
  '/',
  simulationLimiter,
  validateRequest(SimulationRequestSchema),
  simulationController.runSimulation,
);

export default router;
