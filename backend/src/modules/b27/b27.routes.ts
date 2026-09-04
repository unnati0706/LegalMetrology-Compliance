import { Router } from 'express';
import { B27Controller } from './b27.controller.js';
import { 
  queryInspectionsSchema, 
  createInspectionSchema, 
  updateInspectionSchema, 
  getB27ByIdSchema 
} from './b27.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B27Controller();

// GET /api/v1/b27 - search & query inspection history
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryInspectionsSchema }),
  controller.list
);

// POST /api/v1/b27 - create inspection
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: createInspectionSchema }),
  controller.create
);

// GET /api/v1/b27/:id - get inspection details with declarations & checks
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB27ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b27/:id - update inspection or status transition
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB27ByIdSchema, body: updateInspectionSchema }),
  controller.update
);

export default router;
