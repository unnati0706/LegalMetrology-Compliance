import { Router } from 'express';
import { B28Controller } from './b28.controller.js';
import { 
  queryEvidenceSchema, 
  addEvidenceSchema, 
  updateEvidenceSchema, 
  getB28ByIdSchema 
} from './b28.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B28Controller();

// GET /api/v1/b28 - list evidence in locker
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryEvidenceSchema }),
  controller.list
);

// POST /api/v1/b28 - upload / add evidence to locker
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: addEvidenceSchema }),
  controller.add
);

// GET /api/v1/b28/:id - fetch evidence item with signed URL
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB28ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b28/:id - update evidence metadata
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB28ByIdSchema, body: updateEvidenceSchema }),
  controller.update
);

export default router;
