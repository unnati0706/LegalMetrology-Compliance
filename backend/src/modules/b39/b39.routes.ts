import { Router } from 'express';
import { B39Controller } from './b39.controller.js';
import { 
  createSelfCertificationSchema, 
  updateCertificationStatusSchema, 
  queryCertificationsSchema, 
  getCertificationByIdSchema 
} from './b39.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B39Controller();

// GET /api/v1/b39 - List/query self certifications
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryCertificationsSchema }),
  controller.list
);

// POST /api/v1/b39 - Create self-certification & verify artwork (Manufacturer / Admin)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR', 'MANUFACTURER'),
  idempotencyMiddleware,
  validateRequest({ body: createSelfCertificationSchema }),
  controller.create
);

// GET /api/v1/b39/:id - Fetch single certificate
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getCertificationByIdSchema }),
  controller.getById
);

// PATCH /api/v1/b39/:id - Revoke or update certificate status (Admin / Supervisor)
router.patch(
  '/:id',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  validateRequest({ params: getCertificationByIdSchema, body: updateCertificationStatusSchema }),
  controller.updateStatus
);

export default router;
