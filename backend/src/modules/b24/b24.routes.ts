import { Router } from 'express';
import { B24Controller } from './b24.controller.js';
import { 
  validateDatePlacementSchema, 
  queryB24Schema, 
  updateB24Schema, 
  getB24ByIdSchema 
} from './b24.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B24Controller();

// GET /api/v1/b24 - list check results
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryB24Schema }),
  controller.list
);

// POST /api/v1/b24 - evaluate date and placement compliance
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: validateDatePlacementSchema }),
  controller.evaluate
);

// GET /api/v1/b24/:id - get check result by id
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB24ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b24/:id - override check result
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB24ByIdSchema, body: updateB24Schema }),
  controller.update
);

export default router;
