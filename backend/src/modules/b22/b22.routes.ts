import { Router } from 'express';
import { B22Controller } from './b22.controller.js';
import { 
  validateMrpQuantityInputSchema, 
  queryB22Schema, 
  updateB22Schema, 
  getB22ByIdSchema 
} from './b22.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B22Controller();

// GET /api/v1/b22 - list check results for MRP & Net Quantity
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryB22Schema }),
  controller.list
);

// POST /api/v1/b22 - evaluate MRP & Net Quantity compliance
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: validateMrpQuantityInputSchema }),
  controller.evaluate
);

// GET /api/v1/b22/:id - get check result by id
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB22ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b22/:id - override check result
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB22ByIdSchema, body: updateB22Schema }),
  controller.update
);

export default router;
