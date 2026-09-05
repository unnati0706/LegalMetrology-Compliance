import { Router } from 'express';
import { B38Controller } from './b38.controller.js';
import { 
  assessPenaltySchema, 
  updatePenaltyPaymentSchema, 
  queryPenaltiesSchema, 
  getPenaltyByIdSchema 
} from './b38.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B38Controller();

// GET /api/v1/b38 - List/query penalties
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryPenaltiesSchema }),
  controller.list
);

// POST /api/v1/b38 - Assess penalty (Admin / Supervisor)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  idempotencyMiddleware,
  validateRequest({ body: assessPenaltySchema }),
  controller.assess
);

// GET /api/v1/b38/:id - Fetch single penalty assessment
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getPenaltyByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b38/:id - Update payment / compounding status
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  validateRequest({ params: getPenaltyByIdSchema, body: updatePenaltyPaymentSchema }),
  controller.updatePayment
);

export default router;
