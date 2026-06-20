import { Router } from 'express';
import * as templateController from '../controllers/templateController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { TemplateListQuerySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', validateRequest(TemplateListQuerySchema, 'query'), templateController.listTemplates);
router.get('/:id', templateController.getTemplate);

export default router;
