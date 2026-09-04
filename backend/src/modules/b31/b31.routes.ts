import { Router } from 'express';
import { B31Controller } from './b31.controller.js';
import { authenticateJwt } from '../../shared/auth/index.js';
import { rbacGuard } from '../../shared/rbac/index.js';
import { idempotencyMiddleware } from '../../shared/middleware/index.js';

export function createB31Router(): Router {
  const router = Router();
  const controller = new B31Controller();

  router.use(authenticateJwt);

  // GET /api/v1/b31 - All authenticated roles can query analytics
  router.get(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getAnalytics
  );

  // POST /api/v1/b31 - Admin & Supervisor can generate snapshots
  router.post(
    '/',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    idempotencyMiddleware,
    controller.generateSnapshot
  );

  // GET /api/v1/b31/:id - Fetch snapshot by id
  router.get(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR', 'INSPECTOR', 'MANUFACTURER']),
    controller.getSnapshotById
  );

  // PATCH /api/v1/b31/:id - Admin & Supervisor can update/archive snapshots
  router.patch(
    '/:id',
    rbacGuard(['ADMIN', 'SUPERVISOR']),
    controller.updateSnapshot
  );

  return router;
}

export default createB31Router();

