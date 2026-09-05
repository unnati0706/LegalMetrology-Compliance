import { Router } from 'express';
import { B30Controller } from './b30.controller.js';
import { 
  queryReportVersionsSchema, 
  createAmendedReportSchema, 
  updateReportVersionMetaSchema, 
  getB30ByIdSchema,
  diffReportsParamsSchema
} from './b30.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B30Controller();

// GET /api/v1/b30 - list report versions for an inspection
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryReportVersionsSchema }),
  controller.listVersions
);

// POST /api/v1/b30 - create amended report version
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  idempotencyMiddleware,
  validateRequest({ body: createAmendedReportSchema }),
  controller.createAmended
);

// GET /api/v1/b30/diff/:id1/:id2 - structured diff comparing two versions
router.get(
  '/diff/:id1/:id2',
  authenticate,
  validateRequest({ params: diffReportsParamsSchema }),
  controller.compare
);

// GET /api/v1/b30/:id - fetch specific report version
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getB30ByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b30/:id - update report metadata
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'INSPECTOR'),
  validateRequest({ params: getB30ByIdSchema, body: updateReportVersionMetaSchema }),
  controller.update
);

export default router;
