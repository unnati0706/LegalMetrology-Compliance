import { Router } from 'express';
import { B29Controller } from './b29.controller.js';
import { 
  generateReportSchema, 
  queryReportsSchema, 
  updateReportSchema, 
  getB29ByIdSchema 
} from './b29.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B29Controller();

// GET /api/v1/b29 - list reports
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryReportsSchema }),
  controller.list
);

// POST /api/v1/b29 - generate new report for an inspection
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: generateReportSchema }),
  controller.generate
);

// GET /api/v1/b29/:id - fetch report with signed download URL
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB29ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b29/:id - update report status or notes
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB29ByIdSchema, body: updateReportSchema }),
  controller.update
);

export default router;
