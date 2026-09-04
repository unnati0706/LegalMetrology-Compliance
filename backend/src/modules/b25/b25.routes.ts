import { Router } from 'express';
import { B25Controller } from './b25.controller.js';
import { 
  generateViolationsInputSchema, 
  queryViolationsSchema, 
  updateViolationSchema, 
  getViolationByIdSchema 
} from './b25.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B25Controller();

// GET /api/v1/b25 - list violations
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryViolationsSchema }),
  controller.list
);

// POST /api/v1/b25 - generate violations from check results
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: generateViolationsInputSchema }),
  controller.generate
);

// GET /api/v1/b25/:id - get violation with evidence & rule details
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getViolationByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b25/:id - update violation status / resolution
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getViolationByIdSchema, body: updateViolationSchema }),
  controller.update
);

export default router;
