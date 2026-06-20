import { Router } from 'express';
import * as componentController from '../controllers/componentController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ComponentListQuerySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', validateRequest(ComponentListQuerySchema, 'query'), componentController.listComponents);
router.get('/:id', componentController.getComponent);

export default router;
