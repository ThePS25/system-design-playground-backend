import { Router } from 'express';
import * as challengeController from '../controllers/challengeController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { ChallengeListQuerySchema } from '../validators/schemas.js';

const router = Router();

router.get('/', validateRequest(ChallengeListQuerySchema, 'query'), challengeController.listChallenges);
router.get('/:id', challengeController.getChallenge);

export default router;
