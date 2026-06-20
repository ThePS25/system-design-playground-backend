import { Router } from 'express';
import templateRoutes from './templateRoutes.js';
import componentRoutes from './componentRoutes.js';
import challengeRoutes from './challengeRoutes.js';
import challengeValidateRoutes from './challengeValidateRoutes.js';
import simulationRoutes from './simulationRoutes.js';
import costRoutes from './costRoutes.js';
import savedDesignRoutes from './savedDesignRoutes.js';
import { healthCheck } from '../controllers/healthController.js';
import { generalLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/health', healthCheck);
router.use(generalLimiter);
router.use('/templates', templateRoutes);
router.use('/components', componentRoutes);
router.use('/challenges', challengeRoutes);
router.use('/challenge', challengeValidateRoutes);
router.use('/simulation', simulationRoutes);
router.use('/cost', costRoutes);
router.use('/saved-designs', savedDesignRoutes);

export default router;
