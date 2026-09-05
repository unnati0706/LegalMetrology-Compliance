import { Router } from 'express';
import { B23Controller } from './b23.controller.js';
import { 
  validateEntityConsumerCareSchema, 
  queryB23Schema, 
  updateB23Schema, 
  getB23ByIdSchema 
} from './b23.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B23Controller();

// GET /api/v1/b23 - list check results
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryB23Schema }),
  controller.list
);

// POST /api/v1/b23 - evaluate entity & consumer care compliance
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: validateEntityConsumerCareSchema }),
  controller.evaluate
);

// GET /api/v1/b23/:id - get check result by id
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB23ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b23/:id - override check result
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB23ByIdSchema, body: updateB23Schema }),
  controller.update
);

export default router;
