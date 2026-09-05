import { Router } from 'express';
import { B32Controller } from './b32.controller.js';
import { authenticateJwt } from '../../shared/auth/index.js';
import { rbacGuard } from '../../shared/rbac/index.js';
import { idempotencyMiddleware } from '../../shared/middleware/index.js';

export function createB32Router(): Router {
  const router = Router();
  const controller = new B32Controller();

  router.use(authenticateJwt);

  // GET /api/v1/b32 - View patterns
  router.get(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getPatterns
  );

  // POST /api/v1/b32 - Trigger scan (Admin, Supervisor)
  router.post(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    idempotencyMiddleware,
    controller.triggerScan
  );

  // GET /api/v1/b32/:id - Fetch pattern detail
  router.get(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getPatternById
  );

  // PATCH /api/v1/b32/:id - Update status / acknowledge (Admin, Supervisor, Inspector)
  router.patch(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR']),
    controller.updatePatternStatus
  );

  return router;
}

export default createB32Router();

