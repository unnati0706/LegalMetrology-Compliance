import { Router } from 'express';
import { B21Controller } from './b21.controller.js';
import { 
  validateDeclarationsInputSchema, 
  queryCheckResultsSchema, 
  updateCheckResultSchema, 
  getByIdParamsSchema 
} from './b21.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B21Controller();

// GET /api/v1/b21 - list/query check results
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryCheckResultsSchema }),
  controller.list
);

// POST /api/v1/b21 - evaluate completeness
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: validateDeclarationsInputSchema }),
  controller.evaluate
);

// GET /api/v1/b21/:id - fetch single check result
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getByIdParamsSchema }),
  controller.getById
);

// PATCH /api/v1/b21/:id - override / update check result
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getByIdParamsSchema, body: updateCheckResultSchema }),
  controller.update
);

export default router;
