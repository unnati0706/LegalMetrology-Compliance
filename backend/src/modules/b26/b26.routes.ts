import { Router } from 'express';
import { B26Controller } from './b26.controller.js';
import { 
  queryManualReviewSchema, 
  manualReviewResolutionSchema, 
  batchManualReviewSchema, 
  getB26ByIdSchema 
} from './b26.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B26Controller();

// GET /api/v1/b26 - list pending manual review items
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryManualReviewSchema }),
  controller.list
);

// POST /api/v1/b26 - batch assign or review
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: batchManualReviewSchema }),
  controller.batchAssign
);

// GET /api/v1/b26/:id - fetch manual review details
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB26ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b26/:id - resolve manual review with confirm/override/dismiss
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB26ByIdSchema, body: manualReviewResolutionSchema }),
  controller.resolve
);

export default router;
