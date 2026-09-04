import { Router } from 'express';
import { B36Controller } from './b36.controller.js';
import { 
  issueNoticeSchema, 
  updateNoticeStatusSchema, 
  queryNoticesSchema, 
  getNoticeByIdSchema 
} from './b36.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B36Controller();

// GET /api/v1/b36 - List/query legal notices
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryNoticesSchema }),
  controller.list
);

// POST /api/v1/b36 - Issue new legal notice (Admin/Supervisor/Inspector)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: issueNoticeSchema }),
  controller.issue
);

// GET /api/v1/b36/:id - Fetch single legal notice
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getNoticeByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b36/:id - Update legal notice status
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER'),
  validateRequest({ params: getNoticeByIdSchema, body: updateNoticeStatusSchema }),
  controller.update
);

export default router;
