import { Router } from 'express';
import { B37Controller } from './b37.controller.js';
import { 
  submitAppealSchema, 
  reviewAppealSchema, 
  queryAppealsSchema, 
  getAppealByIdSchema 
} from './b37.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B37Controller();

// GET /api/v1/b37 - Query/list manufacturer appeals
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryAppealsSchema }),
  controller.list
);

// POST /api/v1/b37 - Submit appeal with rectification proofs (Manufacturer/Admin/Supervisor)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'MANUFACTURER'),
  idempotencyMiddleware,
  validateRequest({ body: submitAppealSchema }),
  controller.submit
);

// GET /api/v1/b37/:id - Fetch single appeal
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getAppealByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b37/:id - Legal Officer Review & Decision
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  validateRequest({ params: getAppealByIdSchema, body: reviewAppealSchema }),
  controller.review
);

export default router;
