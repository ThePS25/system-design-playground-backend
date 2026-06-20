import { Router } from 'express';
import * as savedDesignController from '../controllers/savedDesignController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { SaveDesignRequestSchema, SavedDesignListQuerySchema } from '../validators/schemas.js';
import { savedDesignLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.get('/', validateRequest(SavedDesignListQuerySchema, 'query'), savedDesignController.listSavedDesigns);
router.post(
  '/',
  savedDesignLimiter,
  validateRequest(SaveDesignRequestSchema),
  savedDesignController.saveDesign,
);

export default router;
