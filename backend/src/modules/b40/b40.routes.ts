import { Router } from 'express';
import { B40Controller } from './b40.controller.js';
import { 
  compileDossierSchema, 
  transmitDossierSchema, 
  queryDossiersSchema, 
  getDossierByIdSchema 
} from './b40.schemas.js';
import { authenticate } from '../../shared/auth/index.js';
import { requireRoles } from '../../shared/rbac/index.js';
import { validateRequest, idempotencyMiddleware } from '../../shared/middleware/index.js';

const router = Router();
const controller = new B40Controller();

// GET /api/v1/b40 - List/query case dossiers
router.get(
  '/',
  authenticate,
  validateRequest({ query: queryDossiersSchema }),
  controller.list
);

// POST /api/v1/b40 - Compile case dossier (Admin / Supervisor)
router.post(
  '/',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  idempotencyMiddleware,
  validateRequest({ body: compileDossierSchema }),
  controller.compile
);

// GET /api/v1/b40/:id - Fetch single case dossier
router.get(
  '/:id',
  authenticate,
  validateRequest({ params: getDossierByIdSchema }),
  controller.getById
);

// POST /api/v1/b40/:id/transmit - Transmit case dossier to external agency
router.post(
  '/:id/transmit',
  authenticate,
  requireRoles('ADMIN', 'SUPERVISOR'),
  validateRequest({ params: getDossierByIdSchema, body: transmitDossierSchema }),
  controller.transmit
);

export default router;
