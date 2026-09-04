import { Router } from 'express';
import { B35Controller } from './b35.controller.js';
import { authenticateJwt } from '../../shared/auth/index.js';
import { rbacGuard } from '../../shared/rbac/index.js';
import { idempotencyMiddleware } from '../../shared/middleware/index.js';

export function createB35Router(): Router {
  const router = Router();
  const controller = new B35Controller();

  router.use(authenticateJwt);

  // GET /api/v1/b35 - Query inspect-next prioritized queue (All authenticated roles)
  router.get(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getQueue
  );

  // POST /api/v1/b35 - Refresh queue items from latest risk scoring (Admin, Supervisor)
  router.post(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    idempotencyMiddleware,
    controller.refreshQueue
  );

  // GET /api/v1/b35/:id - Get queue item detail with sampling checklist
  router.get(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getQueueItemById
  );

  // PATCH /api/v1/b35/:id - Update queue status, assign inspector, or defer (Admin, Supervisor, Inspector)
  router.patch(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR']),
    controller.updateQueueItem
  );

  return router;
}

export default createB35Router();

